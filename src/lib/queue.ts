import type { PriorityLevel, ServiceTier } from './types';

const STANDARD_LEAD_DAYS = 7;
const PRIORITY_LEAD_DAYS = 2;

export const RATES: Record<ServiceTier, { label: string; rate: number; description: string }> = {
	retainer: {
		label: 'Retainer (Pre-paid)',
		rate: 52,
		description: 'Discounted rate (20% off) for your guaranteed hours of work.'
	},
	standard: {
		label: 'Standard (Ad-hoc)',
		rate: 65,
		description: 'For all hours exceeding the monthly retainer.'
	},
	priority: {
		label: 'Priority (Rush)',
		rate: 91,
		description: 'Bypasses the 7-day queue; work starts within 48 hours.'
	}
};

function addBusinessDays(date: Date, days: number): Date {
	const result = new Date(date);
	let added = 0;
	while (added < days) {
		result.setDate(result.getDate() + 1);
		const dow = result.getDay();
		if (dow !== 0 && dow !== 6) added++;
	}
	return result;
}

export function calculateScheduledStart(submittedAt: Date, priority: PriorityLevel): Date {
	const leadDays = priority === 'priority' ? PRIORITY_LEAD_DAYS : STANDARD_LEAD_DAYS;
	return addBusinessDays(submittedAt, leadDays);
}

export function calculateEstimatedDelivery(
	scheduledStart: Date,
	productionDays: number = 2
): Date {
	return addBusinessDays(scheduledStart, productionDays);
}

export function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}

export function getStatusColor(status: string): string {
	switch (status) {
		case 'received':
			return '#6b7280';
		case 'queued':
			return '#f59e0b';
		case 'in_progress':
			return '#3b82f6';
		case 'review':
			return '#8b5cf6';
		case 'complete':
			return '#10b981';
		default:
			return '#6b7280';
	}
}

export function getStatusLabel(status: string): string {
	switch (status) {
		case 'received':
			return 'Received';
		case 'queued':
			return 'In Queue';
		case 'in_progress':
			return 'In Production';
		case 'review':
			return 'In Review';
		case 'complete':
			return 'Complete';
		default:
			return status;
	}
}
