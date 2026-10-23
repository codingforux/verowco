export type PriorityLevel = 'standard' | 'priority';
export type RequestStatus = 'received' | 'queued' | 'in_progress' | 'review' | 'complete';
export type ServiceTier = 'retainer' | 'standard' | 'priority';

export type ClientRequest = {
	id: string;
	client_id: string;
	title: string;
	description: string;
	assets: string;
	priority_level: PriorityLevel;
	status: RequestStatus;
	submitted_at: string;
	scheduled_start: string;
	estimated_delivery: string | null;
	completed_at: string | null;
	production_hours: number | null;
	notes: string | null;
};

export type Client = {
	id: string;
	name: string;
	email: string;
	company: string | null;
	service_tier: ServiceTier;
	retainer_hours: number | null;
	retainer_hours_used: number;
	created_at: string;
};

export interface Database {
	public: {
		Tables: {
			clients: {
				Row: Client;
				Insert: Omit<Client, 'id' | 'created_at' | 'retainer_hours_used'>;
				Update: Partial<Omit<Client, 'id'>>;
				Relationships: [];
			};
			requests: {
				Row: ClientRequest;
				Insert: Omit<ClientRequest, 'id' | 'submitted_at' | 'scheduled_start' | 'estimated_delivery' | 'completed_at' | 'production_hours' | 'notes'>;
				Update: Partial<Omit<ClientRequest, 'id'>>;
				Relationships: [];
			};
		};
		Views: { [_ in never]: never };
		Functions: { [_ in never]: never };
		Enums: {
			priority_level: PriorityLevel;
			request_status: RequestStatus;
			service_tier: ServiceTier;
		};
		CompositeTypes: { [_ in never]: never };
	};
}
