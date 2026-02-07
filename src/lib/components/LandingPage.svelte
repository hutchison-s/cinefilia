<script>
	import BasicCard from "./BasicCard.svelte";
	import NavButton from "./NavButton.svelte";

</script>
<BasicCard title="Welcome to Cinefilia">
  <p class="mt-4 text-center text-sm text-slate-400">
    Movies that <span class="font-medium text-slate-100">stay with you</span>.
  </p>

  <p class="mt-2 text-center text-sm text-slate-400">
    Track what you watch, rate what you love,
    recommend films to friends —
    <span class="italic text-slate-300">or enemies</span>.
  </p>

  <div class="my-5 h-px w-12 mx-auto bg-slate-700/60"></div>

  <div class="flex justify-center">
    <NavButton type="primary" path="/login">
      Enter Cinefilia
    </NavButton>
  </div>
</BasicCard>