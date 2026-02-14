<script lang="ts">
	import { supabase } from '$lib/supabase';

	let email = $state('');
	let loading = $state(false);
	let message = $state('');
	let error = $state('');

	async function handleLogin() {
		loading = true;
		error = '';
		message = '';

		const { error: err } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: `${window.location.origin}/dashboard` }
		});

		if (err) {
			error = err.message;
		} else {
			message = 'Check your email for the login link.';
		}
		loading = false;
	}
</script>

<div class="login-page">
	<div class="login-card">
		<div class="login-brand">
			<span class="brand-mark">V</span>
			<h1>verow.co</h1>
		</div>
		<p class="login-subtitle">Client Production Queue</p>

		<form class="login-form" onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
			<label class="field">
				<span class="field-label">Email Address</span>
				<input
					type="email"
					bind:value={email}
					placeholder="you@company.com"
					required
				/>
			</label>

			<button type="submit" class="btn btn-primary" disabled={loading}>
				{loading ? 'Sending...' : 'Send Login Link'}
			</button>
		</form>

		{#if message}
			<p class="msg success">{message}</p>
		{/if}
		{#if error}
			<p class="msg error">{error}</p>
		{/if}

		<p class="login-footer">
			Questions? Email <a href="mailto:ryan@verow.co">ryan@verow.co</a>
		</p>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 24px;
	}

	.login-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 48px 40px;
		width: 100%;
		max-width: 420px;
	}

	.login-brand {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}

	.brand-mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: var(--accent);
		color: var(--bg-primary);
		font-weight: 700;
		font-size: 20px;
		border-radius: var(--radius-sm);
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
	}

	.login-subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 32px;
	}

	.login-form {
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

	input {
		padding: 10px 14px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-size: 14px;
		outline: none;
		transition: border-color 0.15s;
	}

	input:focus {
		border-color: var(--accent);
	}

	.btn {
		padding: 10px 20px;
		border-radius: var(--radius-sm);
		font-size: 14px;
		font-weight: 600;
		border: none;
		transition: all 0.15s ease;
	}

	.btn-primary {
		background: var(--accent);
		color: var(--bg-primary);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-dim);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.msg {
		margin-top: 16px;
		font-size: 13px;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
	}

	.success {
		background: rgba(16, 185, 129, 0.1);
		color: var(--green);
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	.error {
		background: rgba(255, 77, 77, 0.1);
		color: var(--red);
		border: 1px solid rgba(255, 77, 77, 0.2);
	}

	.login-footer {
		margin-top: 24px;
		font-size: 13px;
		color: var(--text-muted);
		text-align: center;
	}
</style>
