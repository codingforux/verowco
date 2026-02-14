<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { formatDate, getStatusColor, getStatusLabel, RATES } from '$lib/queue';
	import type { ClientRequest, Client } from '$lib/types';
	import { onMount } from 'svelte';

	let requests: ClientRequest[] = $state([]);
	let client: Client | null = $state(null);
	let loading = $state(true);

	onMount(async () => {
		const { data: { session } } = await supabase.auth.getSession();
		if (!session) {
			window.location.href = '/login';
			return;
		}

		const [clientRes, requestsRes] = await Promise.all([
			supabase.from('clients').select('*').eq('id', session.user.id).single(),
			supabase
				.from('requests')
				.select('*')
				.eq('client_id', session.user.id)
				.order('submitted_at', { ascending: false })
		]);

		if (clientRes.data) client = clientRes.data;
		if (requestsRes.data) requests = requestsRes.data;
		loading = false;
	});

	let activeRequests = $derived(requests.filter((r) => r.status !== 'complete'));
	let completedRequests = $derived(requests.filter((r) => r.status === 'complete'));

	let currentRate = $derived(client ? RATES[client.service_tier] : RATES.standard);
	let retainerRemaining = $derived(
		client?.retainer_hours ? client.retainer_hours - client.retainer_hours_used : null
	);
</script>

<div class="dashboard">
	<header class="page-header">
		<div>
			<h1>Production Queue</h1>
			<p class="subtitle">
				{#if client}
					Welcome back, {client.name}
				{:else}
					Your active and completed requests
				{/if}
			</p>
		</div>
		<a href="/submit" class="btn btn-primary">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
			New Request
		</a>
	</header>

	{#if client}
		<div class="stats-row">
			<div class="stat-card">
				<span class="stat-label">Service Tier</span>
				<span class="stat-value">{currentRate.label}</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">Current Rate</span>
				<span class="stat-value">${currentRate.rate}<span class="stat-unit">/hr</span></span>
			</div>
			{#if retainerRemaining !== null}
				<div class="stat-card">
					<span class="stat-label">Retainer Hours Left</span>
					<span class="stat-value">{retainerRemaining}<span class="stat-unit"> hrs</span></span>
				</div>
			{/if}
			<div class="stat-card">
				<span class="stat-label">Active Requests</span>
				<span class="stat-value">{activeRequests.length}</span>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
		</div>
	{:else if activeRequests.length === 0}
		<div class="empty-state">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
			<h3>No Active Requests</h3>
			<p>Your queue is clear. Submit a new request to get started.</p>
			<a href="/submit" class="btn btn-primary" style="margin-top: 12px;">Submit a Request</a>
		</div>
	{:else}
		<section class="queue-section">
			<h2 class="section-title">Active Queue</h2>
			<div class="queue-list">
				{#each activeRequests as req}
					<div class="queue-card">
						<div class="queue-card-header">
							<div class="queue-card-title">
								<h3>{req.title}</h3>
								{#if req.priority_level === 'priority'}
									<span class="badge badge-rush">RUSH</span>
								{/if}
							</div>
							<span class="status-badge" style="--status-color: {getStatusColor(req.status)}">
								{getStatusLabel(req.status)}
							</span>
						</div>
						<p class="queue-card-desc">{req.description}</p>
						<div class="queue-card-timeline">
							<div class="timeline-item">
								<span class="timeline-label">Submitted</span>
								<span class="timeline-date">{formatDate(req.submitted_at)}</span>
							</div>
							<div class="timeline-arrow">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
							</div>
							<div class="timeline-item">
								<span class="timeline-label">Scheduled Start</span>
								<span class="timeline-date">{formatDate(req.scheduled_start)}</span>
							</div>
							{#if req.estimated_delivery}
								<div class="timeline-arrow">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
								</div>
								<div class="timeline-item">
									<span class="timeline-label">Est. Delivery</span>
									<span class="timeline-date accent">{formatDate(req.estimated_delivery)}</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if completedRequests.length > 0}
		<section class="queue-section" style="margin-top: 40px;">
			<h2 class="section-title">Completed</h2>
			<div class="queue-list">
				{#each completedRequests as req}
					<div class="queue-card completed">
						<div class="queue-card-header">
							<h3>{req.title}</h3>
							<span class="status-badge" style="--status-color: {getStatusColor(req.status)}">
								{getStatusLabel(req.status)}
							</span>
						</div>
						<div class="queue-card-meta">
							<span>Completed {req.completed_at ? formatDate(req.completed_at) : ''}</span>
							{#if req.production_hours}
								<span>{req.production_hours} hrs</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 900px;
	}

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 32px;
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

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		border-radius: var(--radius-sm);
		font-size: 14px;
		font-weight: 600;
		border: none;
		transition: all 0.15s ease;
		text-decoration: none;
	}

	.btn-primary {
		background: var(--accent);
		color: var(--bg-primary);
	}

	.btn-primary:hover {
		background: var(--accent-dim);
		text-decoration: none;
	}

	.stats-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
		margin-bottom: 32px;
	}

	.stat-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 20px;
	}

	.stat-label {
		display: block;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 6px;
	}

	.stat-value {
		font-size: 22px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.stat-unit {
		font-size: 14px;
		font-weight: 400;
		color: var(--text-secondary);
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 16px;
	}

	.queue-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.queue-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 24px;
		transition: border-color 0.15s;
	}

	.queue-card:hover {
		border-color: var(--border-light);
	}

	.queue-card.completed {
		opacity: 0.6;
	}

	.queue-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.queue-card-title {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.queue-card-title h3,
	.queue-card-header h3 {
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

	.status-badge {
		padding: 4px 12px;
		border-radius: 100px;
		font-size: 12px;
		font-weight: 600;
		background: color-mix(in srgb, var(--status-color) 15%, transparent);
		color: var(--status-color);
	}

	.queue-card-desc {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 16px;
	}

	.queue-card-timeline {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-top: 16px;
		border-top: 1px solid var(--border);
	}

	.timeline-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.timeline-label {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.timeline-date {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.timeline-date.accent {
		color: var(--accent);
	}

	.timeline-arrow {
		padding-top: 14px;
	}

	.queue-card-meta {
		display: flex;
		gap: 16px;
		color: var(--text-muted);
		font-size: 13px;
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

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.empty-state h3 {
		font-size: 18px;
		margin-top: 16px;
		margin-bottom: 4px;
	}

	.empty-state p {
		color: var(--text-secondary);
		font-size: 14px;
	}
</style>
