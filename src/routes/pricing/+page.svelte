<script lang="ts">
	import { RATES } from '$lib/queue';
</script>

<div class="pricing-page">
	<header class="page-header">
		<h1>Pricing & Rate Structure</h1>
		<p class="subtitle">Three tiers of service to balance your budget and your timeline.</p>
	</header>

	<div class="pricing-grid">
		{#each Object.entries(RATES) as [key, tier]}
			<div class="pricing-card" class:featured={key === 'retainer'}>
				{#if key === 'retainer'}
					<span class="card-badge">Best Value</span>
				{/if}
				<h2>{tier.label}</h2>
				<div class="price">
					<span class="price-amount">${tier.rate}</span>
					<span class="price-unit">/hr</span>
				</div>
				<p class="price-desc">{tier.description}</p>
				{#if key === 'retainer'}
					<div class="price-detail">20% discount on standard rate</div>
				{:else if key === 'priority'}
					<div class="price-detail rush">40% rush premium applied</div>
				{/if}
			</div>
		{/each}
	</div>

	<section class="info-section">
		<h2>How the Queue Works</h2>
		<div class="info-grid">
			<div class="info-card">
				<div class="info-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
				</div>
				<h3>7-Day Lead Time</h3>
				<p>All standard requests are scheduled to begin 7 business days from submission. This ensures dedicated, focused production time.</p>
			</div>
			<div class="info-card">
				<div class="info-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
				</div>
				<h3>Priority Routing</h3>
				<p>Time-sensitive projects can bypass the standard queue. Work begins within 48 hours at the priority rate. Limited availability.</p>
			</div>
			<div class="info-card">
				<div class="info-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
				</div>
				<h3>Production Time</h3>
				<p>Once work begins, small updates are typically completed within 24-48 hours. Larger projects are scoped individually.</p>
			</div>
		</div>
	</section>

	<section class="formula-section">
		<div class="formula-card">
			<h3>The Timeline Formula</h3>
			<div class="formula">
				<span class="formula-part">Request Date</span>
				<span class="formula-op">+</span>
				<span class="formula-part highlight">7 Days Lead Time</span>
				<span class="formula-op">+</span>
				<span class="formula-part">Production Time</span>
				<span class="formula-op">=</span>
				<span class="formula-part accent">Delivery Date</span>
			</div>
		</div>
	</section>
</div>

<style>
	.pricing-page {
		max-width: 900px;
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

	.pricing-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-bottom: 48px;
	}

	.pricing-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 32px 24px;
		position: relative;
	}

	.pricing-card.featured {
		border-color: var(--accent);
		background: var(--accent-glow);
	}

	.card-badge {
		position: absolute;
		top: -10px;
		left: 24px;
		background: var(--accent);
		color: var(--bg-primary);
		font-size: 11px;
		font-weight: 700;
		padding: 2px 10px;
		border-radius: 100px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.pricing-card h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.price {
		margin-bottom: 12px;
	}

	.price-amount {
		font-size: 36px;
		font-weight: 700;
	}

	.price-unit {
		font-size: 16px;
		color: var(--text-secondary);
	}

	.price-desc {
		color: var(--text-secondary);
		font-size: 13px;
		line-height: 1.5;
	}

	.price-detail {
		margin-top: 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--green);
	}

	.price-detail.rush {
		color: var(--orange);
	}

	.info-section {
		margin-bottom: 48px;
	}

	.info-section h2 {
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 20px;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}

	.info-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 24px;
	}

	.info-icon {
		margin-bottom: 12px;
	}

	.info-card h3 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.info-card p {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.formula-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 32px;
		text-align: center;
	}

	.formula-card h3 {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 20px;
	}

	.formula {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.formula-part {
		padding: 8px 16px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-size: 14px;
		font-weight: 600;
	}

	.formula-part.highlight {
		border-color: var(--blue);
		color: var(--blue);
	}

	.formula-part.accent {
		border-color: var(--accent);
		color: var(--accent);
	}

	.formula-op {
		font-size: 18px;
		font-weight: 700;
		color: var(--text-muted);
	}

	@media (max-width: 768px) {
		.pricing-grid, .info-grid {
			grid-template-columns: 1fr;
		}
		.formula {
			flex-direction: column;
		}
	}
</style>
