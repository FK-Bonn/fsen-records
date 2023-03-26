<script type="ts">
    import type {IPermission, IUserWithPermissions} from "../Interfaces";
    import {onMount} from "svelte";
    import {fsen, loggedInUser, token} from "../stores";
    import {
        createAccount,
        editPermissions,
        hasFsPermission,
        loadUsersList,
        permissionLevelToString,
        permissionToString,
        resetPassword
    } from "../util";

    export let isAdmin: boolean = false;

    const hasEditPermission = () => {
        if (!$loggedInUser) {
            return false;
        }
        return $loggedInUser.admin || $loggedInUser.permissions.some(permission => permission.level >= 2);
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

    const updateCreatePermission = (fs: string, level: number) => {
        if (hasFsPermission(createAccountPermissions, fs, level)) {
            createAccountPermissions = createAccountPermissions.filter(p => p.fs !== fs);
        } else {
            createAccountPermissions = createAccountPermissions.filter(p => p.fs !== fs);
            createAccountPermissions = [...createAccountPermissions, {fs:fs, level: level}].sort();
        }
    }

    const updatePermission = (fs: string, level: number) => {
        if (hasFsPermission(editPermissionsPermissions, fs, level)) {
            editPermissionsPermissions = editPermissionsPermissions.filter(p => p.fs !== fs);
            editPermissionsPermissions = [...editPermissionsPermissions, {fs: fs, level: 0}].sort();
        } else {
            editPermissionsPermissions = editPermissionsPermissions.filter(p => p.fs !== fs);
            editPermissionsPermissions = [...editPermissionsPermissions, {fs:fs, level: level}].sort();
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
                    ({usersList.get(userId).permissions.map(permissionToString).join(', ')})
                    <button class="button is-small" on:click={()=>loadEditPermissions(usersList.get(userId))}>
                        Rechte bearbeiten
                    </button>
                    <button class="button is-small" on:click={()=>loadResetPassword(usersList.get(userId))}>
                        Passwort zurücksetzen
                    </button>
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
            <div class="field">
                <label class="checkbox">
                    <input type="checkbox" checked={hasFsPermission(createAccountPermissions, fs, 1)}
                           on:click={()=>updateCreatePermission(fs, 1)}>
                    {permissionLevelToString(1)}
                </label>
                <label class="checkbox">
                    <input type="checkbox" checked={hasFsPermission(createAccountPermissions, fs, 2)}
                           on:click={()=>updateCreatePermission(fs, 2)}>
                    {permissionLevelToString(2)}
                </label>
                | {fs}
            </div>
        {/each}
    {:else}
        <hr>

        <b>Berechtigungen:</b>

        {#each $loggedInUser.permissions as p}
            <div class="field">
                <label class="checkbox">
                    <input type="checkbox" checked={hasFsPermission(createAccountPermissions, p.fs, 1)}
                           on:click={()=>updateCreatePermission(p.fs, 1)}>
                    {permissionLevelToString(1)}
                </label>
                {#if hasFsPermission($loggedInUser.permissions, p.fs, 2)}
                    <label class="checkbox">
                        <input type="checkbox" checked={hasFsPermission(createAccountPermissions, p.fs, 2)}
                               on:click={()=>updateCreatePermission(p.fs, 2)}>
                        {permissionLevelToString(2)}
                    </label>
                {/if}
                | {p.fs}
            </div>
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
            <div class="field">
                <label class="checkbox">
                    <input type="checkbox" checked={hasFsPermission(editPermissionsPermissions, fs, 1)}
                           on:click={()=>updatePermission(fs, 1)}>
                    {permissionLevelToString(1)}
                </label>
                <label class="checkbox">
                    <input type="checkbox" checked={hasFsPermission(editPermissionsPermissions, fs, 2)}
                           on:click={()=>updatePermission(fs, 2)}>
                    {permissionLevelToString(2)}
                </label>
                | {fs}
            </div>
        {/each}
    {:else}
        <hr>

        <b>Berechtigungen:</b>

        {#each $loggedInUser.permissions as p}
            {#if hasFsPermission($loggedInUser.permissions, p.fs, 2)}
                <div class="field">
                    <label class="checkbox">
                        <input type="checkbox" checked={hasFsPermission(editPermissionsPermissions, p.fs, 1)}
                               on:click={()=>updatePermission(p.fs, 1)}>
                        {permissionLevelToString(1)}
                    </label>
                    <label class="checkbox">
                        <input type="checkbox" checked={hasFsPermission(editPermissionsPermissions, p.fs, 2)}
                               on:click={()=>updatePermission(p.fs, 2)}>
                        {permissionLevelToString(2)}
                    </label>
                    | {p.fs}
                </div>
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