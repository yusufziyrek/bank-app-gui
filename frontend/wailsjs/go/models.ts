export namespace main {
	
	export class AccountView {
	    id: string;
	    user_id: string;
	    account_number: string;
	    balance: number;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new AccountView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user_id = source["user_id"];
	        this.account_number = source["account_number"];
	        this.balance = source["balance"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class AppConfig {
	    api_base_url: string;
	
	    static createFrom(source: any = {}) {
	        return new AppConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.api_base_url = source["api_base_url"];
	    }
	}
	export class CardView {
	    id: string;
	    account_id: string;
	    card_number: string;
	    masked_pan: string;
	    expiry_date: string;
	    is_active: boolean;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new CardView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.account_id = source["account_id"];
	        this.card_number = source["card_number"];
	        this.masked_pan = source["masked_pan"];
	        this.expiry_date = source["expiry_date"];
	        this.is_active = source["is_active"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class UserView {
	    id: string;
	    full_name: string;
	    email: string;
	    role: string;
	    is_active: boolean;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new UserView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.full_name = source["full_name"];
	        this.email = source["email"];
	        this.role = source["role"];
	        this.is_active = source["is_active"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class SessionView {
	    access_token: string;
	    refresh_token: string;
	    expires_at: number;
	    user?: UserView;
	
	    static createFrom(source: any = {}) {
	        return new SessionView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.access_token = source["access_token"];
	        this.refresh_token = source["refresh_token"];
	        this.expires_at = source["expires_at"];
	        this.user = this.convertValues(source["user"], UserView);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TransactionInput {
	    account_id: string;
	    to_account_id?: string;
	    amount: number;
	    type: string;
	    description?: string;
	
	    static createFrom(source: any = {}) {
	        return new TransactionInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.account_id = source["account_id"];
	        this.to_account_id = source["to_account_id"];
	        this.amount = source["amount"];
	        this.type = source["type"];
	        this.description = source["description"];
	    }
	}
	export class TransactionUpdateInput {
	    amount?: number;
	    description?: string;
	
	    static createFrom(source: any = {}) {
	        return new TransactionUpdateInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.amount = source["amount"];
	        this.description = source["description"];
	    }
	}
	export class TransactionView {
	    id: string;
	    account_id: string;
	    to_account_id?: string;
	    amount: number;
	    type: string;
	    description: string;
	    created_at: string;
	
	    static createFrom(source: any = {}) {
	        return new TransactionView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.account_id = source["account_id"];
	        this.to_account_id = source["to_account_id"];
	        this.amount = source["amount"];
	        this.type = source["type"];
	        this.description = source["description"];
	        this.created_at = source["created_at"];
	    }
	}
	export class UpdateCardInput {
	    card_number?: string;
	    cvv?: string;
	    expiry_date?: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateCardInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.card_number = source["card_number"];
	        this.cvv = source["cvv"];
	        this.expiry_date = source["expiry_date"];
	    }
	}

}

