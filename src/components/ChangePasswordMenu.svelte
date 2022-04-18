<script type="ts">
    import {token} from "../stores";
    import {changePassword} from "../util";

    let currentPassword: string = '';
    let newPassword: string = '';
    let message: string | null = null;

    const changePasswordWithData = async () => {
        message = null;
        message = await changePassword(
            currentPassword,
            newPassword,
            $token,
        );
    }

</script>

<div class="field">
    <label class="label" for="current-password">Aktuelles Passwort</label>
    <div class="control">
        <input class="input" id="current-password" type="password" placeholder="das aktuelle Passwort"
               bind:value={currentPassword}>
    </div>
</div>
<div class="field">
    <label class="label" for="new-password">Neues Passwort</label>
    <div class="control">
        <input class="input" id="new-password" type="password" placeholder="am besten zufällig generiert"
               bind:value={newPassword}>
    </div>
</div>
<button class="button is-primary" on:click={changePasswordWithData}>Passwort ändern</button>
{#if message}
    <article class="message">
        <div class="message-body">
            {message}
        </div>
    </article>
{/if}
