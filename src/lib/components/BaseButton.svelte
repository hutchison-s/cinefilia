<script lang="ts">
  export let btnClass = '';
  export let type: 'primary' | 'secondary' | 'danger' | 'back' = 'primary';
  export let disabled = false;
  export let fullWidth = false;
  export let buttonType: 'button' | 'submit' | 'reset' = 'button';

  const base =
    'px-6 py-1.5 cursor-pointer text-base font-light rounded transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-primary hover:bg-gradient-secondary-primary text-white hover:opacity-90',
    secondary:
      'bg-gradient-secondary text-white hover:brightness-110 disabled:saturation-50 disabled:opacity-50',
    danger: 'bg-danger text-white hover:brightness-90 disabled:bg-danger-300',
    back: '!p-2 bg-transparent text-gray-400 rounded hover:text-gray-200 disabled:opacity-50 disabled:saturation-50'
  };
</script>

<button
  type={buttonType}
  class={[
    base,
    variants[type],
    fullWidth && 'w-full',
    btnClass
  ].filter(Boolean).join(' ')}
  disabled={disabled}
  on:click
>
  <slot />
</button>
