<script type="ts">
    import type {IUserWithPermissions} from "../Interfaces";
    import {onMount} from "svelte";
    import {fsen, token} from "../stores";
    import {createAccount, editPermissions, loadUsersList, resetPassword} from "../util";

    let usersList: Map<string, IUserWithPermissions> | null = null;
    let activeTab: string = 'accounts';

    let createAccountUsername: string = '';
    let createAccountPassword: string = '';
    let createAccountAdmin: boolean = false;
    let createAccountPermissions: string[] = [];
    let createdAccount: IUserWithPermissions | null = null;
    let createdMessage: string | null = null;

    let editPermissionsUsername: string = '';
    let editPermissionsAdmin: boolean = false;
    let editPermissionsPermissions: string[] = [];
    let updatedAccount: IUserWithPermissions | null = null;
    let permissionsMessage: string | null = null;

    let resetPasswordUsername: string = '';
    let resetPasswordPassword: string = '';
    let resetMessage: string | null = null;

    const toggleCreatePermission = (fs: string) => {
        if (createAccountPermissions.includes(fs)) {
            createAccountPermissions = createAccountPermissions.filter(value => value !== fs);
        } else {
            createAccountPermissions = [...createAccountPermissions, fs].sort();
        }
    }

    const togglePermission = (fs: string) => {
        if (editPermissionsPermissions.includes(fs)) {
            editPermissionsPermissions = editPermissionsPermissions.filter(value => value !== fs);
        } else {
            editPermissionsPermissions = [...editPermissionsPermissions, fs].sort();
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
        <li class={activeTab === 'accounts' ? 'is-active' : ''}>
            <a on:click={()=>activeTab='accounts'}>Accounts</a>
        </li>
        <li class={activeTab === 'create_account' ? 'is-active' : ''}>
            <a on:click={()=>activeTab='create_account'}>Account anlegen</a>
        </li>
        <li class={activeTab === 'edit_permissions' ? 'is-active' : ''}>
            <a on:click={()=>activeTab='edit_permissions'}>Rechte bearbeiten</a>
        </li>
        <li class={activeTab === 'reset_password' ? 'is-active' : ''}>
            <a on:click={()=>activeTab='reset_password'}>Passwort zurücksetzen</a>
        </li>
    </ul>
</div>

{#if activeTab === 'accounts'}
    {#if usersList}
        <ul>
            {#each [...usersList.keys()].sort() as userId}
                <li>
                    {usersList.get(userId).username}
                    {#if usersList.get(userId).admin}<span class="tag is-info">Admin</span>{/if}
                    ({usersList.get(userId).permissions.join(', ')})
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
                <input type="checkbox" checked={createAccountPermissions.includes(fs)}
                       on:click={()=>toggleCreatePermission(fs)}>
                {fs}
            </label>
        </div>
    {/each}

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
                <input type="checkbox" checked={editPermissionsPermissions.includes(fs)}
                       on:click={()=>togglePermission(fs)}>
                {fs}
            </label>
        </div>
    {/each}

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