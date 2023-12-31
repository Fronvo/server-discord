// ******************** //
// The fetchPROCH account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    FetchPROCHResult,
    FetchPROCHServerParams,
} from 'interfaces/account/fetchPROCH';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { decryptAES, generateError } from 'utilities/global';
import { getEnv } from 'variables/varUtils';

async function fetchPROCH({
    account,
    secret,
}: FetchPROCHServerParams): Promise<FetchPROCHResult | FronvoError> {
    if (secret != getEnv('PRO_SECRET')) {
        return generateError('UNKNOWN');
    }

    if (!account.turbo || !account.turboCH) {
        return generateError('UNKNOWN');
    }

    return { proCH: decryptAES(account.turboCH) };
}

const fetchPROCHTemplate: EventTemplate = {
    func: fetchPROCH,
    template: ['secret'],
    schema: new StringSchema({
        secret: {
            minLength: 36,
        },
    }),
};

export default fetchPROCHTemplate;
