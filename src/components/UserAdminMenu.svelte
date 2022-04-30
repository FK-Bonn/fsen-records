<script type="ts">
    import type {IUserWithPermissions} from "../Interfaces";
    import {fsen, loggedInUser, token} from "../stores";
    import {createAccount, loadUsersList} from "../util";

    let activeTab: string = 'create_account';

    let createAccountUsername: string = '';
    let createAccountPassword: string = '';
    let createAccountAdmin: boolean = false;
    let createAccountPermissions: string[] = [...$loggedInUser.permissions];
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

    const toggleCreatePermission = (fs: string) => {
        if (createAccountPermissions.includes(fs)) {
            createAccountPermissions = createAccountPermissions.filter(value => value !== fs);
        } else {
            createAccountPermissions = [...createAccountPermissions, fs].sort();
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

    {#each $loggedInUser.permissions as fs}
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
{/if}


<style>
    ul {
        margin-left: 2em;
        list-style-type: circle;
    }
</style>