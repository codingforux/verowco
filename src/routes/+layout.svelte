<script lang="ts">
	import '../app.css';
	import { supabase } from '$lib/supabase';
	import type { Snippet } from 'svelte';
	import type { Session } from '@supabase/supabase-js';

	let { children }: { children: Snippet } = $props();
	let session: Session | null = $state(null);

	$effect(() => {
		supabase.auth.getSession().then(({ data }) => {
			session = data.session;
		});

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
			session = s;
		});

		return () => subscription.unsubscribe();
	});

	async function handleLogout() {
		await supabase.auth.signOut();
		window.location.href = '/login';
	}
</script>

<div class="app-shell">
	<nav class="sidebar">
		<div class="sidebar-brand">
			<span class="brand-mark">V</span>
			<span class="brand-text">verow.co</span>
		</div>

		<div class="sidebar-nav">
			<a href="/dashboard" class="nav-item">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
				Dashboard
			</a>
			<a href="/submit" class="nav-item">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
				New Request
			</a>
			<a href="/pricing" class="nav-item">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
				Pricing
			</a>
			<a href="/admin" class="nav-item">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
				Admin
			</a>
		</div>

		{#if session}
			<div class="sidebar-footer">
				<button class="nav-item logout-btn" onclick={handleLogout}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
					Sign Out
				</button>
			</div>
		{/if}
	</nav>

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
	}

	.sidebar {
		width: 240px;
		background: var(--bg-secondary);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		padding: 24px 16px;
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
	}

	.sidebar-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 12px;
		margin-bottom: 32px;
	}

	.brand-mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--accent);
		color: var(--bg-primary);
		font-weight: 700;
		font-size: 16px;
		border-radius: var(--radius-sm);
	}

	.brand-text {
		font-weight: 600;
		font-size: 16px;
		color: var(--text-primary);
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		transition: all 0.15s ease;
		border: none;
		background: none;
		width: 100%;
		text-align: left;
		text-decoration: none;
	}

	.nav-item:hover {
		background: var(--bg-card);
		color: var(--text-primary);
		text-decoration: none;
	}

	.sidebar-footer {
		border-top: 1px solid var(--border);
		padding-top: 16px;
	}

	.logout-btn {
		color: var(--text-muted);
	}
	.logout-btn:hover {
		color: var(--red);
	}

	.main-content {
		flex: 1;
		margin-left: 240px;
		padding: 40px;
		max-width: 1200px;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 64px;
			padding: 16px 8px;
		}
		.brand-text {
			display: none;
		}
		.main-content {
			margin-left: 64px;
			padding: 24px 16px;
		}
	}
</style>
