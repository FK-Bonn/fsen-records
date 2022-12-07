<script type="ts">
    import type {IPermission, IUserWithPermissions} from "../Interfaces";
    import {loggedInUser, token} from "../stores";
    import {createAccount, hasFsPermission, permissionLevelToString, permissionToString} from "../util";

    let activeTab: string = 'create_account';

    let createAccountUsername: string = '';
    let createAccountPassword: string = '';
    let createAccountAdmin: boolean = false;
    let createAccountPermissions: IPermission[] = [...$loggedInUser.permissions];
    let createdAccount: IUserWithPermissions | null = null;
    let createdMessage: string | null = null;

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
    }

    const updateCreatePermission = (fs: string, level: number) => {
        if (hasFsPermission(createAccountPermissions, fs, level)) {
            createAccountPermissions = createAccountPermissions.filter(cap => cap.fs !== fs);
        } else {
            createAccountPermissions = createAccountPermissions.filter(cap => cap.fs !== fs);
            createAccountPermissions = [...createAccountPermissions, {fs: fs, level: level}].sort();
        }
    }

</script>

<div class="tabs">
    <ul>
        <li class={activeTab === 'create_account' ? 'is-active' : ''}>
            <a on:click={()=>activeTab='create_account'}>Account anlegen</a>
        </li>
    </ul>
</div>

{#if activeTab === 'create_account'}
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

    <button class="button is-primary" on:click={createAccountWithData}>Account erstellen</button>
    {#if createdMessage}
        <article class="message">
            <div class="message-body">
                {createdMessage}
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