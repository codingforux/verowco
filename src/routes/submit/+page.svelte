<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { calculateScheduledStart, calculateEstimatedDelivery, formatDate } from '$lib/queue';
	import type { PriorityLevel } from '$lib/types';
	import { onMount } from 'svelte';

	let title = $state('');
	let description = $state('');
	let assets = $state('');
	let priorityLevel: PriorityLevel = $state('standard');
	let loading = $state(false);
	let success = $state(false);
	let error = $state('');

	let now = new Date();
	let scheduledStart = $derived(calculateScheduledStart(now, priorityLevel));
	let estimatedDelivery = $derived(calculateEstimatedDelivery(scheduledStart));

	onMount(async () => {
		const { data: { session } } = await supabase.auth.getSession();
		if (!session) window.location.href = '/login';
	});

	async function handleSubmit() {
		loading = true;
		error = '';

		const { data: { session } } = await supabase.auth.getSession();
		if (!session) {
			error = 'You must be logged in.';
			loading = false;
			return;
		}

		const start = calculateScheduledStart(new Date(), priorityLevel);
		const delivery = calculateEstimatedDelivery(start);

		const { error: err } = await supabase.from('requests').insert({
			client_id: session.user.id,
			title,
			description,
			assets,
			priority_level: priorityLevel,
			status: 'received',
			scheduled_start: start.toISOString().split('T')[0],
			estimated_delivery: delivery.toISOString().split('T')[0]
		});

		if (err) {
			error = err.message;
		} else {
			success = true;
		}
		loading = false;
	}
</script>

<div class="submit-page">
	<header class="page-header">
		<h1>Submit a Request</h1>
		<p class="subtitle">Fill out the details below. The 7-day lead time begins once all assets are received.</p>
	</header>

	{#if success}
		<div class="success-card">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
			<h2>Request Submitted</h2>
			<p>Your request has been added to the queue.</p>
			<div class="success-timeline">
				<div class="timeline-block">
					<span class="timeline-label">Scheduled Start</span>
					<span class="timeline-val">{formatDate(scheduledStart.toISOString())}</span>
				</div>
				<div class="timeline-block">
					<span class="timeline-label">Estimated Delivery</span>
					<span class="timeline-val accent">{formatDate(estimatedDelivery.toISOString())}</span>
				</div>
			</div>
			<div class="success-actions">
				<a href="/dashboard" class="btn btn-primary">View Dashboard</a>
				<button class="btn btn-secondary" onclick={() => { success = false; title = ''; description = ''; assets = ''; priorityLevel = 'standard'; }}>
					Submit Another
				</button>
			</div>
		</div>
	{:else}
		<form class="submit-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<div class="form-grid">
				<label class="field full">
					<span class="field-label">Task Name</span>
					<input
						type="text"
						bind:value={title}
						placeholder="e.g. June Promotional Banner"
						required
					/>
				</label>

				<label class="field full">
					<span class="field-label">Task Description</span>
					<textarea
						bind:value={description}
						placeholder="Brief explanation of what needs to be changed or built..."
						rows="4"
						required
					></textarea>
				</label>

				<label class="field full">
					<span class="field-label">Assets</span>
					<textarea
						bind:value={assets}
						placeholder="List any images, text, links, or login credentials needed..."
						rows="3"
					></textarea>
				</label>

				<div class="field full">
					<span class="field-label">Priority Level</span>
					<div class="priority-options">
						<label class="priority-option" class:selected={priorityLevel === 'standard'}>
							<input type="radio" name="priority" value="standard" bind:group={priorityLevel} />
							<div class="priority-content">
								<span class="priority-name">Standard</span>
								<span class="priority-desc">Scheduled into the 7-day queue</span>
							</div>
							<span class="priority-rate">$65/hr</span>
						</label>
						<label class="priority-option" class:selected={priorityLevel === 'priority'}>
							<input type="radio" name="priority" value="priority" bind:group={priorityLevel} />
							<div class="priority-content">
								<span class="priority-name">Priority (Rush)</span>
								<span class="priority-desc">Start within 48 hours — Rush Fee applies</span>
							</div>
							<span class="priority-rate rush">$91/hr</span>
						</label>
					</div>
				</div>
			</div>

			<div class="timeline-preview">
				<h3>Estimated Timeline</h3>
				<div class="timeline-flow">
					<div class="timeline-node">
						<div class="node-dot"></div>
						<span class="node-label">Request Date</span>
						<span class="node-date">{formatDate(now.toISOString())}</span>
					</div>
					<div class="timeline-connector"></div>
					<div class="timeline-node">
						<div class="node-dot active"></div>
						<span class="node-label">{priorityLevel === 'priority' ? '2-Day' : '7-Day'} Lead Time</span>
						<span class="node-date">{formatDate(scheduledStart.toISOString())}</span>
					</div>
					<div class="timeline-connector"></div>
					<div class="timeline-node">
						<div class="node-dot accent"></div>
						<span class="node-label">Est. Delivery</span>
						<span class="node-date accent">{formatDate(estimatedDelivery.toISOString())}</span>
					</div>
				</div>
			</div>

			{#if error}
				<p class="msg error">{error}</p>
			{/if}

			<button type="submit" class="btn btn-primary btn-lg" disabled={loading}>
				{loading ? 'Submitting...' : 'Submit Request'}
			</button>
		</form>
	{/if}
</div>

<style>
	.submit-page {
		max-width: 720px;
	}

	.page-header {
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

	.submit-form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-grid {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-label {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
	}

	input, textarea {
		padding: 10px 14px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-size: 14px;
		outline: none;
		transition: border-color 0.15s;
		resize: vertical;
	}

	input:focus, textarea:focus {
		border-color: var(--accent);
	}

	.priority-options {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.priority-option {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.15s;
	}

	.priority-option:hover {
		border-color: var(--border-light);
	}

	.priority-option.selected {
		border-color: var(--accent);
		background: var(--accent-glow);
	}

	.priority-option input {
		display: none;
	}

	.priority-content {
		flex: 1;
	}

	.priority-name {
		display: block;
		font-weight: 600;
		font-size: 14px;
	}

	.priority-desc {
		font-size: 12px;
		color: var(--text-muted);
	}

	.priority-rate {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.priority-rate.rush {
		color: var(--orange);
	}

	.timeline-preview {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 24px;
	}

	.timeline-preview h3 {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 20px;
	}

	.timeline-flow {
		display: flex;
		align-items: flex-start;
	}

	.timeline-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		min-width: 120px;
	}

	.node-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--border-light);
	}

	.node-dot.active {
		background: var(--blue);
	}

	.node-dot.accent {
		background: var(--accent);
	}

	.node-label {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.node-date {
		font-size: 14px;
		font-weight: 600;
	}

	.node-date.accent {
		color: var(--accent);
	}

	.timeline-connector {
		flex: 1;
		height: 2px;
		background: var(--border);
		margin-top: 5px;
		min-width: 40px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 20px;
		border-radius: var(--radius-sm);
		font-size: 14px;
		font-weight: 600;
		border: none;
		transition: all 0.15s ease;
		text-decoration: none;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--accent);
		color: var(--bg-primary);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-dim);
	}

	.btn-secondary {
		background: var(--bg-card);
		color: var(--text-primary);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		border-color: var(--border-light);
	}

	.btn-lg {
		padding: 14px 28px;
		font-size: 15px;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.success-card {
		text-align: center;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 48px 32px;
	}

	.success-card h2 {
		font-size: 22px;
		margin-top: 16px;
		margin-bottom: 4px;
	}

	.success-card > p {
		color: var(--text-secondary);
		font-size: 14px;
	}

	.success-timeline {
		display: flex;
		justify-content: center;
		gap: 32px;
		margin: 24px 0;
	}

	.timeline-block {
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

	.timeline-val {
		font-size: 16px;
		font-weight: 700;
	}

	.timeline-val.accent {
		color: var(--accent);
	}

	.success-actions {
		display: flex;
		justify-content: center;
		gap: 12px;
	}

	.msg.error {
		background: rgba(255, 77, 77, 0.1);
		color: var(--red);
		border: 1px solid rgba(255, 77, 77, 0.2);
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		font-size: 13px;
	}
</style>
