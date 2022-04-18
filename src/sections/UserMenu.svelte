<script type="ts">

    import {loggedInUser, token} from "../stores";
    import {onMount} from "svelte";
    import LoginMenu from "./LoginMenu.svelte";
    import {loadLoggedInUser} from "../util";
    import LoggedInMenu from "../components/LoggedInMenu.svelte";

    onMount(async () => {
        $loggedInUser = await loadLoggedInUser($token);
    });
</script>

{#if $loggedInUser}
    <LoggedInMenu/>
{:else}
    <LoginMenu/>
{/if}
