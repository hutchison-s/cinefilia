<script lang="ts">
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
  <title>Connection Invite - Cinefilia</title>
</svelte:head>

<section class="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-8">
  <div class="w-full rounded-xl border border-slate-800 bg-black/40 p-6">
    <h1 class="text-2xl font-semibold text-white">Connection Invite</h1>

    <p class="mt-4 text-slate-200">
      <span class="font-semibold">{data.invite.template?.initiatorUserName}</span>
      invited you to connect on Cinefilia.
    </p>

    <p class="mt-2 text-sm text-slate-400">{data.invite.template?.initiatorUserEmail}</p>

    {#if data.invite.existingForUser?.status}
      <div class="mt-6 rounded-lg border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-200">
        You already marked this invite as <span class="font-semibold uppercase">{data.invite.existingForUser.status}</span>.
      </div>
    {/if}

    <div class="mt-6 flex flex-wrap gap-3">
      <form method="POST" action="?/accept">
        <button
          type="submit"
          class="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600"
        >
          Accept Invite
        </button>
      </form>

      <form method="POST" action="?/reject">
        <button
          type="submit"
          class="rounded-lg bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-600"
        >
          Reject Invite
        </button>
      </form>

      <a
        href="/connections"
        class="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 hover:bg-slate-900"
      >
        Back to Connections
      </a>
    </div>
  </div>
</section>
