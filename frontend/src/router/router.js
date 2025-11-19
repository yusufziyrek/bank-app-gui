import { store } from '../store/store';

class Router {
    constructor() {
        this.routes = {};
    }

    addRoute(viewId, renderFn) {
        this.routes[viewId] = renderFn;
    }

    navigate(viewId) {
        store.setState({ currentView: viewId });
    }

    render(viewId) {
        const renderFn = this.routes[viewId];
        if (renderFn) {
            return renderFn();
        }
        return `<div>View not found: ${viewId}</div>`;
    }
}

export const router = new Router();
