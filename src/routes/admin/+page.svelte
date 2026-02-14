<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { formatDate, getStatusColor, getStatusLabel, RATES } from '$lib/queue';
	import type { ClientRequest, Client, RequestStatus } from '$lib/types';
	import { onMount } from 'svelte';

	let requests: (ClientRequest & { client?: Client })[] = $state([]);
	let clients: Client[] = $state([]);
	let loading = $state(true);
	let filter: RequestStatus | 'all' = $state('all');
	let editingId: string | null = $state(null);

	const statuses: RequestStatus[] = ['received', 'queued', 'in_progress', 'review', 'complete'];

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		const [reqRes, clientRes] = await Promise.all([
			supabase.from('requests').select('*').order('submitted_at', { ascending: false }),
			supabase.from('clients').select('*')
		]);

		if (clientRes.data) clients = clientRes.data;
		if (reqRes.data) {
			requests = reqRes.data.map((r: ClientRequest) => ({
				...r,
				client: clientRes.data?.find((c: Client) => c.id === r.client_id)
			}));
		}
		loading = false;
	}

	let filteredRequests = $derived(
		filter === 'all' ? requests : requests.filter((r) => r.status === filter)
	);

	async function updateStatus(id: string, newStatus: RequestStatus) {
		const updates: Record<string, unknown> = { status: newStatus };
		if (newStatus === 'complete') {
			updates.completed_at = new Date().toISOString();
		}

		await supabase.from('requests').update(updates).eq('id', id);
		await loadData();
		editingId = null;
	}

	async function updateHours(id: string, hours: string) {
		const parsed = parseFloat(hours);
		if (isNaN(parsed)) return;
		await supabase.from('requests').update({ production_hours: parsed }).eq('id', id);
		await loadData();
	}
</script>

<div class="admin-page">
	<header class="page-header">
		<div>
			<h1>Admin — Queue Manager</h1>
			<p class="subtitle">{requests.length} total requests, {requests.filter(r => r.status !== 'complete').length} active</p>
		</div>
	</header>

	<div class="filter-bar">
		<button class="filter-btn" class:active={filter === 'all'} onclick={() => filter = 'all'}>
			All ({requests.length})
		</button>
		{#each statuses as status}
			<button
				class="filter-btn"
				class:active={filter === status}
				onclick={() => filter = status}
			>
				<span class="filter-dot" style="background: {getStatusColor(status)}"></span>
				{getStatusLabel(status)} ({requests.filter(r => r.status === status).length})
			</button>
		{/each}
	</div>

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
		</div>
	{:else}
		<div class="admin-list">
			{#each filteredRequests as req}
				<div class="admin-card">
					<div class="admin-card-top">
						<div class="admin-card-info">
							<div class="admin-card-title-row">
								<h3>{req.title}</h3>
								{#if req.priority_level === 'priority'}
									<span class="badge badge-rush">RUSH</span>
								{/if}
							</div>
							{#if req.client}
								<span class="client-name">{req.client.name} — {req.client.company || req.client.email}</span>
							{/if}
						</div>

						<div class="admin-card-actions">
							{#if editingId === req.id}
								<div class="status-selector">
									{#each statuses as status}
										<button
											class="status-option"
											class:current={req.status === status}
											onclick={() => updateStatus(req.id, status)}
										>
											<span class="status-dot" style="background: {getStatusColor(status)}"></span>
											{getStatusLabel(status)}
										</button>
									{/each}
								</div>
							{:else}
								<button class="status-badge-btn" style="--status-color: {getStatusColor(req.status)}" onclick={() => editingId = req.id}>
									{getStatusLabel(req.status)}
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
								</button>
							{/if}
						</div>
					</div>

					<p class="admin-card-desc">{req.description}</p>

					{#if req.assets}
						<div class="admin-card-assets">
							<span class="assets-label">Assets:</span> {req.assets}
						</div>
					{/if}

					<div class="admin-card-meta">
						<div class="meta-item">
							<span class="meta-label">Submitted</span>
							<span>{formatDate(req.submitted_at)}</span>
						</div>
						<div class="meta-item">
							<span class="meta-label">Scheduled</span>
							<span>{formatDate(req.scheduled_start)}</span>
						</div>
						{#if req.estimated_delivery}
							<div class="meta-item">
								<span class="meta-label">Delivery</span>
								<span class="accent">{formatDate(req.estimated_delivery)}</span>
							</div>
						{/if}
						<div class="meta-item hours-input">
							<span class="meta-label">Hours</span>
							<input
								type="number"
								step="0.5"
								min="0"
								value={req.production_hours ?? ''}
								placeholder="0"
								onchange={(e) => updateHours(req.id, (e.target as HTMLInputElement).value)}
							/>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if clients.length > 0}
		<section class="clients-section">
			<h2>Clients</h2>
			<div class="clients-grid">
				{#each clients as c}
					<div class="client-card">
						<h4>{c.name}</h4>
						<span class="client-email">{c.email}</span>
						<div class="client-meta">
							<span class="tier-badge">{RATES[c.service_tier].label}</span>
							{#if c.retainer_hours}
								<span class="retainer-info">{c.retainer_hours_used}/{c.retainer_hours} hrs used</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.admin-page {
		max-width: 960px;
	}

	.page-header {
		margin-bottom: 24px;
	}

	h1 {
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.5px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin-top: 4px;
	}

	.filter-bar {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}

	.filter-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		border-radius: 100px;
		font-size: 13px;
		font-weight: 500;
		border: 1px solid var(--border);
		background: var(--bg-card);
		color: var(--text-secondary);
		transition: all 0.15s;
	}

	.filter-btn:hover {
		border-color: var(--border-light);
		color: var(--text-primary);
	}

	.filter-btn.active {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-glow);
	}

	.filter-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.admin-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.admin-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 24px;
	}

	.admin-card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 8px;
	}

	.admin-card-title-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.admin-card-title-row h3 {
		font-size: 16px;
		font-weight: 600;
	}

	.badge {
		padding: 2px 8px;
		border-radius: var(--radius-xs);
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.badge-rush {
		background: rgba(245, 158, 11, 0.15);
		color: var(--orange);
		border: 1px solid rgba(245, 158, 11, 0.3);
	}

	.client-name {
		font-size: 13px;
		color: var(--text-muted);
	}

	.status-badge-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 12px;
		border-radius: 100px;
		font-size: 12px;
		font-weight: 600;
		background: color-mix(in srgb, var(--status-color) 15%, transparent);
		color: var(--status-color);
		border: 1px solid color-mix(in srgb, var(--status-color) 30%, transparent);
		cursor: pointer;
		transition: all 0.15s;
	}

	.status-badge-btn:hover {
		background: color-mix(in srgb, var(--status-color) 25%, transparent);
	}

	.status-selector {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 4px;
		min-width: 160px;
	}

	.status-option {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border-radius: var(--radius-xs);
		font-size: 13px;
		font-weight: 500;
		border: none;
		background: none;
		color: var(--text-secondary);
		cursor: pointer;
		width: 100%;
	}

	.status-option:hover {
		background: var(--bg-card);
		color: var(--text-primary);
	}

	.status-option.current {
		background: var(--bg-card);
		color: var(--text-primary);
		font-weight: 600;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.admin-card-desc {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 12px;
	}

	.admin-card-assets {
		font-size: 13px;
		color: var(--text-muted);
		margin-bottom: 12px;
		padding: 8px 12px;
		background: var(--bg-secondary);
		border-radius: var(--radius-xs);
	}

	.assets-label {
		font-weight: 600;
		color: var(--text-secondary);
	}

	.admin-card-meta {
		display: flex;
		gap: 24px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.meta-label {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.meta-item span:last-child {
		font-size: 13px;
		font-weight: 600;
	}

	.accent {
		color: var(--accent);
	}

	.hours-input input {
		width: 60px;
		padding: 4px 8px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		color: var(--text-primary);
		font-size: 13px;
		font-weight: 600;
		outline: none;
	}

	.hours-input input:focus {
		border-color: var(--accent);
	}

	.clients-section {
		margin-top: 48px;
	}

	.clients-section h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.clients-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}

	.client-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 20px;
	}

	.client-card h4 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 2px;
	}

	.client-email {
		font-size: 13px;
		color: var(--text-muted);
	}

	.client-meta {
		display: flex;
		gap: 12px;
		margin-top: 12px;
		align-items: center;
	}

	.tier-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 100px;
		background: var(--accent-glow);
		color: var(--accent);
		border: 1px solid rgba(200, 255, 0, 0.2);
	}

	.retainer-info {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.loading-state {
		display: flex;
		justify-content: center;
		padding: 60px 0;
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
