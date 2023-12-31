// ******************** //
// The updateProfileStatus account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    UpdateProfileStatusResult,
    UpdateProfileStatusServerParams,
} from 'interfaces/account/updateProfileStatus';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function updateProfileStatus({
    io,
    socket,
    status,
}: UpdateProfileStatusServerParams): Promise<
    UpdateProfileStatusResult | FronvoError
> {
    try {
        await prismaClient.account.update({
            where: {
                profileId: getSocketAccountId(socket.id),
            },

            data: {
                status,
                statusUpdatedTime: new Date(),
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    io.to(getSocketAccountId(socket.id)).emit('profileStatusUpdated', {
        profileId: getSocketAccountId(socket.id),
        status,
    });

    return {};
}

const updateProfileStatusTemplate: EventTemplate = {
    func: updateProfileStatus,
    template: ['status'],
    schema: new StringSchema({
        status: {
            maxLength: 20,
        },
    }),
    dontFetchAccount: true,
};

export default updateProfileStatusTemplate;
