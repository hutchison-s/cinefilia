<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { Eye, X } from 'lucide-svelte';
  import type { PageData } from './$types';

  const { data, form } = $props<{ data: PageData; form: import('./$types').ActionData }>();

  const inviteStatusLabels = {
    accepted: 'Invite accepted.',
    rejected: 'Invite rejected.'
  } as const;

  let shareLinkUrl = $state('');
  let pendingDelete = $state<{
    recordId: string;
    action: '?/stopConnection';
    label: string;
  } | null>(null);

  $effect(() => {
    if (form?.shareUrl) {
      shareLinkUrl = form.shareUrl;
    }
  });

  const handleLinkShare: SubmitFunction = () => {
    return async ({ result }) => {
      await applyAction(result);

      if (result.type !== 'success') {
        return;
      }

      const shareUrl = result.data?.shareUrl;
      if (typeof shareUrl !== 'string') {
        return;
      }

      shareLinkUrl = shareUrl;

      if (!navigator.share) {
        return;
      }

      try {
        await navigator.share({
          title: 'Cinefilia shared lists',
          text: 'Take a look at the lists I shared with you on Cinefilia.',
          url: shareUrl
        });
      } catch {
        // Ignore user-cancelled native share prompts.
      }
    };
  };

  async function copyShareLink() {
    if (!shareLinkUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareLinkUrl);
  }

  function formatDate(value: string | Date | null | undefined) {
    if (!value) {
      return 'Unknown';
    }

    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function openDeleteModal(
    recordId: string,
    action: '?/stopConnection',
    label: string
  ) {
    pendingDelete = {
      recordId,
      action,
      label
    };
  }
</script>

<svelte:head>
  <title>Connections - Cinefilia</title>
</svelte:head>

<section class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
  <h1 class="border-y border-primary bg-gradient-to-br via-transparent to-primary/50 py-2 text-center text-2xl font-semibold uppercase text-white">
    Connections
  </h1>

  {#if form?.error}
    <div class="rounded-lg border border-red-700 bg-red-950/60 p-4 text-sm text-red-100">
      {form.error}
    </div>
  {/if}

  {#if form?.success}
    <div class="rounded-lg border border-emerald-700 bg-emerald-950/50 p-4 text-sm text-emerald-100">
      {form.success}
    </div>
  {/if}

  {#if data.inviteStatus && inviteStatusLabels[data.inviteStatus as keyof typeof inviteStatusLabels]}
    <div class="rounded-lg border border-sky-700 bg-sky-950/50 p-4 text-sm text-sky-100">
      {inviteStatusLabels[data.inviteStatus as keyof typeof inviteStatusLabels]}
    </div>
  {/if}

  <div class="grid gap-6 lg:grid-cols-2">
    <article class="rounded-xl border border-slate-800 bg-black/35 p-5 lg:col-span-2">
      <h2 class="text-lg font-semibold text-white">Connect</h2>

      <div class="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <form method="POST" action="?/shareByEmail" class="space-y-4">
          <div>
            <label class="block text-sm text-slate-300" for="share-email">Email</label>
            <input
              id="share-email"
              name="email"
              type="email"
              required
              class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              placeholder="friend@example.com"
            />
          </div>

          <button
            type="submit"
          class="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:brightness-110"
          >
            Lookup Via Email
          </button>
        </form>

        <div class="flex flex-col justify-end gap-4">
          <form
            method="POST"
            action="?/createLinkShare"
            use:enhance={handleLinkShare}
            class="space-y-4"
          >
            <button
              type="submit"
              class="w-full rounded-lg bg-slate-700 px-4 py-2 font-medium text-white transition hover:bg-slate-600"
            >
              Invite Via Link
            </button>
          </form>

          {#if shareLinkUrl}
            <div class="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
              <p class="break-all text-sm text-slate-200">{shareLinkUrl}</p>
              <button
                type="button"
                class="mt-3 rounded-md bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
                onclick={copyShareLink}
              >
                Copy Link
              </button>
            </div>
          {/if}
        </div>
      </div>
    </article>
  </div>

  <article class="rounded-xl border border-slate-800 bg-black/35 p-5">
    <h2 class="text-lg font-semibold text-white">Pending Invites</h2>

    {#if data.connections.incomingPending.length === 0}
      <p class="mt-3 text-sm text-slate-400">No pending invites right now.</p>
    {:else}
      <div class="mt-4 space-y-4">
        {#each data.connections.incomingPending as share}
          <div class="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
            <p class="text-white">
              <span class="font-semibold">{share.sharingUserName}</span>
              invited you to connect.
            </p>
            <p class="mt-1 text-sm text-slate-400">{share.sharingUserEmail} • Sent {formatDate(share.pendingAt)}</p>
            <div class="mt-4 flex flex-wrap gap-3">
              <form method="POST" action="?/respondToPending">
                <input type="hidden" name="recordId" value={share.id} />
                <input type="hidden" name="status" value="accepted" />
                <button
                  type="submit"
                  class="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  Accept
                </button>
              </form>

              <form method="POST" action="?/respondToPending">
                <input type="hidden" name="recordId" value={share.id} />
                <input type="hidden" name="status" value="rejected" />
                <button
                  type="submit"
                  class="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600"
                >
                  Reject
                </button>
              </form>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </article>

  <div class="grid gap-6 lg:grid-cols-2">
    <article class="rounded-xl border border-slate-800 bg-black/35 p-5">
      <h2 class="text-lg font-semibold text-white">Connections</h2>

      {#if data.connections.acceptedConnections.length === 0}
        <p class="mt-3 text-sm text-slate-400">No connections yet.</p>
      {:else}
        <div class="mt-4 space-y-2">
          {#each data.connections.acceptedConnections as share}
            <div class="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm text-white">
                    <span class="font-semibold">{share.otherUserName ?? share.otherUserEmail}</span>
                  </p>
                </div>

                <div class="flex shrink-0 items-center gap-1">
                  <a
                    class="rounded-md p-2 text-slate-200 transition hover:bg-slate-800 hover:text-white"
                    href={`/connections/view/${share.otherUserId}`}
                    title="View connection"
                    aria-label="View connection"
                  >
                    <Eye size={16} />
                  </a>

                  <button
                    type="button"
                    class="rounded-md p-2 text-slate-300 transition hover:bg-slate-800 hover:text-red-300"
                    title="Remove connection"
                    aria-label="Remove connection"
                    onclick={() => openDeleteModal(share.id, '?/stopConnection', `Remove your connection with ${share.otherUserName ?? share.otherUserEmail}?`)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div class="mt-1 space-y-0.5">
                <p class="text-xs text-slate-500">{share.otherUserEmail}</p>
                <p class="text-xs text-slate-500">Accepted {formatDate(share.acceptedAt)}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </article>

    <article class="rounded-xl border border-slate-800 bg-black/35 p-5">
      <h2 class="text-lg font-semibold text-white">Sent Invites</h2>

      {#if data.connections.outgoingPending.length === 0}
        <p class="mt-3 text-sm text-slate-400">No sent invites right now.</p>
      {:else}
        <div class="mt-4 space-y-2">
          {#each data.connections.outgoingPending as share}
            <div class="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm text-white">
                    <span class="font-semibold">{share.targetUserName ?? share.targetUserEmail}</span>
                  </p>
                </div>

                <div class="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    class="rounded-md p-2 text-slate-300 transition hover:bg-slate-800 hover:text-red-300"
                    title="Cancel invite"
                    aria-label="Cancel invite"
                    onclick={() => openDeleteModal(share.id, '?/stopConnection', `Cancel your invite to ${share.targetUserName ?? share.targetUserEmail}?`)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div class="mt-1 space-y-0.5">
                <p class="text-xs text-slate-500">{share.targetUserEmail}</p>
                <p class="text-xs text-slate-500">
                  Sent {formatDate(share.pendingAt)}
                </p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </article>
  </div>
</section>

{#if pendingDelete}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div class="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-950 p-5 shadow-2xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-base font-semibold text-white">Confirm</h3>
          <p class="mt-2 text-sm text-slate-300">{pendingDelete.label}</p>
        </div>

        <button
          type="button"
          class="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          onclick={() => {
            pendingDelete = null;
          }}
          aria-label="Close confirmation dialog"
        >
          <X size={16} />
        </button>
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700"
          onclick={() => {
            pendingDelete = null;
          }}
        >
          Cancel
        </button>

        <form method="POST" action={pendingDelete.action}>
          <input type="hidden" name="recordId" value={pendingDelete.recordId} />
          <button
            type="submit"
            class="rounded-md bg-red-800 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
