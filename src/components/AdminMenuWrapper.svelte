<script type="ts">
    import AdminMenu from "./AdminMenu.svelte";
    import UserAdminMenu from "./UserAdminMenu.svelte";

    export let isAdmin: boolean = false;
</script>

{#if isAdmin}
    <AdminMenu/>
{:else}
    <UserAdminMenu/>
{/if}