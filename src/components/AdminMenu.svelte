<script type="ts">
    import type {IPermission, IUserWithPermissions} from "../Interfaces";
    import {onMount} from "svelte";
    import {fsen, loggedInUser, token} from "../stores";
    import {
        createAccount,
        editPermissions, hasAnyFsPermission,
        hasFsPermission,
        loadUsersList,
        PERMISSIONS,
        permissionsToString,
        permissionToString,
        resetPassword
    } from "../util";

    export let isAdmin: boolean = false;

    const hasEditPermission = () => {
        if (!$loggedInUser) {
            return false;
        }
        return $loggedInUser.admin || $loggedInUser.permissions.some(permission => permission.write_permissions);
    }

    let usersList: Map<string, IUserWithPermissions> | null = null;
    let activeTab: string = hasEditPermission() ? 'accounts' : 'create_account';

    let createAccountUsername: string = '';
    let createAccountPassword: string = '';
    let createAccountAdmin: boolean = false;
    let createAccountPermissions: IPermission[] = [];
    let createdAccount: IUserWithPermissions | null = null;
    let createdMessage: string | null = null;

    let editPermissionsUsername: string = '';
    let editPermissionsAdmin: boolean = false;
    let editPermissionsPermissions: IPermission[] = [];
    let updatedAccount: IUserWithPermissions | null = null;
    let permissionsMessage: string | null = null;

    let resetPasswordUsername: string = '';
    let resetPasswordPassword: string = '';
    let resetMessage: string | null = null;

    const updateCreatePermission = (fs: string, permission: keyof IPermission, value: boolean) => {
        const permissionForFS = createAccountPermissions.filter(p => p.fs === fs);
        if (permissionForFS.length) {
            permissionForFS[0][permission] = value;
        } else {
            const newPermission = {
                fs: fs,
                read_permissions: false,
                write_permissions: false,
                read_files: false,
                read_public_data: false,
                write_public_data: false,
                read_protected_data: false,
                write_protected_data: false,
                submit_payout_request: false,
                locked: false,
            }
            newPermission[permission] = value;
            createAccountPermissions = [...createAccountPermissions, newPermission].sort();
        }
    }

    const updatePermission = (fs: string, permission: keyof IPermission, value: boolean) => {
        console.log(fs, permission, value, editPermissionsPermissions)
        const permissionForFS = editPermissionsPermissions.filter(p => p.fs === fs);
        if (permissionForFS.length) {
            permissionForFS[0][permission] = value;
        } else {
            const newPermission = {
                fs: fs,
                read_permissions: false,
                write_permissions: false,
                read_files: false,
                read_public_data: false,
                write_public_data: false,
                read_protected_data: false,
                write_protected_data: false,
                submit_payout_request: false,
                locked: false,
            }
            newPermission[permission] = value;
            editPermissionsPermissions = [...editPermissionsPermissions, newPermission].sort();
        }
    }

    const createAccountWithData = async () => {
        createdMessage = null;
        const createResult = await createAccount(
            createAccountUsername,
            createAccountPassword,
            createAccountAdmin,
            createAccountPermissions,
            $token,
        );
        createdAccount = createResult.user;
        createdMessage = createResult.message;
        usersList = await loadUsersList($token);
    }

    const editPermissionsWithData = async () => {
        permissionsMessage = null;
        const editResult = await editPermissions(
            isAdmin,
            editPermissionsUsername,
            editPermissionsAdmin,
            editPermissionsPermissions,
            $token,
        );
        updatedAccount = editResult.user;
        permissionsMessage = editResult.message;
        usersList = await loadUsersList($token);
    }

    const resetPasswordWithData = async () => {
        resetMessage = null;
        resetMessage = await resetPassword(
            resetPasswordUsername,
            resetPasswordPassword,
            $token,
        );
    }

    const loadEditPermissions = (user: IUserWithPermissions) => {
        editPermissionsUsername = user.username;
        editPermissionsAdmin = user.admin;
        editPermissionsPermissions = user.permissions;
        activeTab = 'edit_permissions';
    }

    const loadResetPassword = (user: IUserWithPermissions) => {
        resetPasswordUsername = user.username;
        activeTab = 'reset_password';
    }

    onMount(async () => {
        usersList = await loadUsersList($token);
    })
</script>

<div class="tabs">
    <ul>
        {#if hasEditPermission()}
            <li class={activeTab === 'accounts' ? 'is-active' : ''}>
                <a on:click={()=>activeTab='accounts'}>Accounts</a>
            </li>
        {/if}
        <li class={activeTab === 'create_account' ? 'is-active' : ''}>
            <a on:click={()=>activeTab='create_account'}>Account anlegen</a>
        </li>
        {#if hasEditPermission()}
            <li class={activeTab === 'edit_permissions' ? 'is-active' : ''}>
                <a on:click={()=>activeTab='edit_permissions'}>Rechte bearbeiten</a>
            </li>
        {/if}
        {#if isAdmin}
            <li class={activeTab === 'reset_password' ? 'is-active' : ''}>
                <a on:click={()=>activeTab='reset_password'}>Passwort zurücksetzen</a>
            </li>
        {/if}
    </ul>
</div>

{#if activeTab === 'accounts'}
    {#if usersList}
        <ul>
            {#each [...usersList.keys()].sort() as userId}
                <li>
                    {usersList.get(userId).username}
                    {#if usersList.get(userId).admin}<span class="tag is-info">Admin</span>{/if}
                    <button class="button is-small" on:click={()=>loadEditPermissions(usersList.get(userId))}>
                        Rechte bearbeiten
                    </button>
                    <button class="button is-small" on:click={()=>loadResetPassword(usersList.get(userId))}>
                        Passwort zurücksetzen
                    </button>
                    <ul>
                        {#each usersList.get(userId).permissions.map(permissionsToString) as permissions}
                            <li>{permissions}</li>
                        {/each}
                    </ul>
                </li>
            {/each}
        </ul>
    {:else}
        Loading…
    {/if}
{:else if activeTab === 'create_account'}
    <div class="field">
        <label class="label" for="create-account-username">Login-Name</label>
        <div class="control">
            <input class="input" id="create-account-username" type="text" placeholder="vorname.nachname"
                   bind:value={createAccountUsername}>
        </div>
    </div>
    <div class="field">
        <label class="label" for="create-account-password">Passwort</label>
        <div class="control">
            <input class="input" id="create-account-password" type="text" placeholder="am besten zufällig generiert"
                   bind:value={createAccountPassword}>
        </div>
    </div>
    {#if isAdmin}
        <div class="field">
            <label class="checkbox" for="create-account-admin">
                <input type="checkbox" id="create-account-admin" bind:checked={createAccountAdmin}>
                Admin
            </label>
        </div>

        <hr>

        {#each $fsen as fs}
            <details open="{hasAnyFsPermission(createAccountPermissions, fs)}">
                <summary>{fs}</summary>
                <ul>
                    {#each PERMISSIONS as permission}
                        <li>
                            <label class="checkbox">
                                <input type="checkbox"
                                       checked={hasFsPermission(createAccountPermissions, fs, permission)}
                                       on:click={(event)=>updateCreatePermission(fs, permission, event.target.checked)}>
                                {permissionToString(permission)}
                            </label>
                        </li>
                    {/each}
                    <li>
                        <label class="checkbox">
                            <input type="checkbox"
                                   checked={hasFsPermission(createAccountPermissions, fs, 'locked')}
                                   on:click={(event)=>updateCreatePermission(fs, 'locked', event.target.checked)}>
                            {permissionToString('locked')}
                        </label>
                    </li>
                </ul>
            </details>
        {/each}
    {:else}
        <hr>

        <b>Berechtigungen:</b>

        {#each $loggedInUser.permissions as p}
            {#if p.write_permissions}
                <details open>
                    <summary>{p.fs}</summary>
                    <ul>
                        {#each PERMISSIONS as permission}
                            <li>
                                <label class="checkbox">
                                    <input type="checkbox"
                                           checked={hasFsPermission(createAccountPermissions, p.fs, permission)}
                                           on:click={(event)=>updateCreatePermission(p.fs, permission, event.target.checked)}>
                                    {permissionToString(permission)}
                                </label>
                            </li>
                        {/each}
                    </ul>
                </details>
            {/if}
        {/each}
    {/if}

    <button class="button is-primary" on:click={createAccountWithData}>Account erstellen</button>
    {#if createdMessage}
        <article class="message">
            <div class="message-body">
                {createdMessage}
            </div>
        </article>
    {/if}
{:else if activeTab === 'edit_permissions'}
    <div class="field">
        <label class="label" for="create-account-username">Login-Name</label>
        <div class="control">
            <input class="input" id="edit-permissions-username" type="text" placeholder="vorname.nachname"
                   bind:value={editPermissionsUsername}>
        </div>
    </div>
    {#if isAdmin}
        <div class="field">
            <label class="checkbox" for="create-account-admin">
                <input type="checkbox" id="edit-permissions-admin" bind:checked={editPermissionsAdmin}>
                Admin
            </label>
        </div>

        <hr>

        {#each $fsen as fs}
            <details open="{hasAnyFsPermission(editPermissionsPermissions, fs)}">
                <summary>{fs}</summary>
                <ul>
                    {#each PERMISSIONS as permission}
                        <li>
                            <label class="checkbox">
                                <input type="checkbox"
                                       checked={hasFsPermission(editPermissionsPermissions, fs, permission)}
                                       on:click={(event)=>updatePermission(fs, permission, event.target.checked)}>
                                {permissionToString(permission)}
                            </label>
                        </li>
                    {/each}
                    <li>
                        <label class="checkbox">
                            <input type="checkbox"
                                   checked={hasFsPermission(editPermissionsPermissions, fs, 'locked')}
                                   on:click={(event)=>updatePermission(fs, 'locked', event.target.checked)}>
                            {permissionToString('locked')}
                        </label>
                    </li>
                </ul>
            </details>
        {/each}
    {:else}
        <hr>

        <b>Berechtigungen:</b>

        {#each $loggedInUser.permissions as p}
            {#if p.write_permissions}
            <details open>
                <summary>{p.fs}</summary>
                <ul>
                    {#each PERMISSIONS as permission}
                        <li>
                            <label class="checkbox">
                                <input type="checkbox" disabled={hasFsPermission(editPermissionsPermissions, p.fs, 'locked')}
                                       checked={hasFsPermission(editPermissionsPermissions, p.fs, permission)}
                                       on:click={(event)=>updatePermission(p.fs, permission, event.target.checked)}>
                                {permissionToString(permission)}
                            </label>
                        </li>
                    {/each}
                    <li>
                        <label class="checkbox" disabled>
                            <input type="checkbox" disabled
                                   checked={hasFsPermission(editPermissionsPermissions, p.fs, 'locked')}>
                            {permissionToString('locked')}
                        </label>
                    </li>
                </ul>
            </details>
            {/if}
        {/each}
    {/if}

    <button class="button is-primary" on:click={editPermissionsWithData}>Rechte speichern</button>
    {#if permissionsMessage}
        <article class="message">
            <div class="message-body">
                {permissionsMessage}
            </div>
        </article>
    {/if}
{:else if activeTab === 'reset_password'}
    <div class="field">
        <label class="label" for="create-account-username">Login-Name</label>
        <div class="control">
            <input class="input" id="reset-password-username" type="text" placeholder="vorname.nachname"
                   bind:value={resetPasswordUsername}>
        </div>
    </div>
    <div class="field">
        <label class="label" for="create-account-password">Passwort</label>
        <div class="control">
            <input class="input" id="reset-password-password" type="text" placeholder="am besten zufällig generiert"
                   bind:value={resetPasswordPassword}>
        </div>
    </div>
    <button class="button is-primary" on:click={resetPasswordWithData}>Passwort ändern</button>
    {#if resetMessage}
        <article class="message">
            <div class="message-body">
                {resetMessage}
            </div>
        </article>
    {/if}
{/if}


<style>
    ul {
        margin-left: 2em;
        list-style-type: circle;
    }
</style>