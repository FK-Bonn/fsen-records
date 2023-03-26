<script type="ts">
    import {loggedInUser, token} from "../stores";
    import AdminMenu from "./AdminMenu.svelte";
    import ChangePasswordMenu from "./ChangePasswordMenu.svelte";

    const logout = () => {
        $token = '';
        $loggedInUser = null;
    }

    let showAdminMenu: boolean = false;
    let navbarVisible: boolean = false;
    let showChangePasswordMenu: boolean = false;

    const toggleAdminMenu = () => {
        showAdminMenu = !showAdminMenu;
    }
    const toggleNavbarView = () => {
        navbarVisible = !navbarVisible;
    }
    const toggleChangePasswordMenu = () => {
        showChangePasswordMenu = !showChangePasswordMenu;
    }
</script>

<nav class="navbar is-primary" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            <img alt="fsen-records" src="/logo.png">
        </a>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbar"
           on:click={toggleNavbarView}>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div id="navbar" class="navbar-menu {navbarVisible ? ' is-active' : ''}">
        <div class="navbar-start">
            <div class="navbar-item">
                Hallo {$loggedInUser.username}!
            </div>
            {#if $loggedInUser.admin}
                <div class="navbar-item">
                    <span class="tag is-info">Admin</span>
                </div>
            {/if}
            <a class="navbar-item" on:click={toggleAdminMenu}>
                Verwaltung
            </a>
            <a class="navbar-item" on:click={toggleChangePasswordMenu}>
                Passwort ändern
            </a>
        </div>

        <div class="navbar-end">
            <div class="navbar-item">
                <div class="field is-horizontal">
                    <div class="field-body">
                        <div class="field">
                            <button class="button" on:click={logout}>Abmelden</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</nav>

{#if showAdminMenu}
    <div class="box">
        <AdminMenu isAdmin="{$loggedInUser.admin}"/>
    </div>
{/if}
{#if showChangePasswordMenu}
    <div class="box">
        <ChangePasswordMenu/>
    </div>
{/if}
