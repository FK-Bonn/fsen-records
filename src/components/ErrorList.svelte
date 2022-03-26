<script type="ts">
    export let errors: string[] = [];
</script>

<section class="section">
    <div class="container">
        <article class="message is-danger">
            <div class="message-header">
                <p>Probleme</p>
            </div>
            <div class="message-body">
                <ul>
                    {#each errors as error}
                        <li>{error}</li>
                    {/each}
                </ul>
            </div>
        </article>
    </div>
</section>