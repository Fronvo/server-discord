// ******************** //
// Interfaces for the deletePost event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface DeletePostParams {
    postId: string;
}

export interface DeletePostServerParams
    extends EventArguments,
        DeletePostParams {}

export interface DeletePostResult {}

export interface DeletePostTestResult extends FronvoError, DeletePostResult {}
