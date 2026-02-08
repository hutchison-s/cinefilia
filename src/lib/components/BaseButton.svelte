<script lang="ts">
  export let btnClass = '';
  export let type: 'primary' | 'secondary' | 'danger' = 'primary';
  export let disabled = false;
  export let fullWidth = false;
  export let buttonType: 'button' | 'submit' | 'reset' = 'button';

  const base =
    'px-6 py-1.5 cursor-pointer text-base font-light rounded transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-primary hover:bg-gradient-secondary-primary text-white hover:opacity-90',
    secondary:
      'bg-transparent text-secondary border border-secondary-500 hover:bg-secondary-100 disabled:bg-secondary-200',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 disabled:bg-danger-300'
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
