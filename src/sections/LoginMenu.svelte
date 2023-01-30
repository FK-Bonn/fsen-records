<script type="ts">

    import {backendPrefix} from "../settings";
    import {allFsData, loggedInUser, token} from "../stores";
    import {getAllFsData, loadLoggedInUser} from "../util";

    const login = () => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        fetch(backendPrefix + '/token', {method: 'POST', body: formData})
            .then(response => {
                if (response.status !== 200) {
                    return Promise.reject('Login fehlgeschlagen.');
                }
                return response.json();
            })
            .then(response => {
                $token = response['access_token'];
                return loadLoggedInUser($token);
            })
            .then(user => {
                $loggedInUser = user;
                return getAllFsData($token);
            }).then(fsData => {
                $allFsData = fsData;
            }, (message) => {
                alert(message);
            });
    }

    const handleKeydown = (event) => {
        if (event.code == 'Enter') {
            login();
        }
    }

    let navbarVisible: boolean = false;

    const toggleNavbarView = () => {
        navbarVisible = !navbarVisible;
    }

    let username: string = '';
    let password: string = '';
</script>

<nav class="navbar is-light" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            <img alt="fsen-records" src="/logo.png">
        </a>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" on:click={toggleNavbarView}>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div id="navbar" class="navbar-menu {navbarVisible ? ' is-active' : ''}">
        <div class="navbar-end">
            <div class="navbar-item">
                <div class="field is-horizontal">
                    <div class="field-body">
                        <div class="field">
                            <p class="control">
                                <input class="input" type="text" placeholder="Name" bind:value={username}>
                            </p>
                        </div>
                        <div class="field">
                            <p class="control">
                                <input class="input" type="password" placeholder="Passwort" bind:value={password}
                                       on:keydown={handleKeydown}>
                            </p>
                        </div>
                        <div class="field">
                            <button class="button" on:click={login}>Anmelden</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</nav>



