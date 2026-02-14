<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	onMount(async () => {
		const { data: { session } } = await supabase.auth.getSession();
		if (session) {
			window.location.href = '/dashboard';
		} else {
			window.location.href = '/login';
		}
	});
</script>

<div class="loading">
	<div class="spinner"></div>
</div>

<style>
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80vh;
	}
	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
