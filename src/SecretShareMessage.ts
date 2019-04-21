import {
    PlainMessage,
    Account,
    NetworkType,
    EncryptedMessage,
} from 'nem2-sdk';

import secrets from 'secrets.js-grempe';

export class SecretShareMessage {

    /**
     * Creates a PlainMessage with an encrypted secret payload
     * @param message message you wish to encrypt
     * @param shardedPrivateKeyShares sharded private key - should meet the threshold
     * @param threshold minimum number of shares needed to decrypt
     * @returns PlainMessage
     */
    public static create(message: string, shardedPrivateKeyShares: [any], threshold: number): EncryptedMessage {
        if (shardedPrivateKeyShares.length < threshold) {
            throw Error('number of shares not do match the threshold');
        } else {
            const privateKey = secrets.combine(shardedPrivateKeyShares.slice(0, threshold));
            const account = Account.createFromPrivateKey(secrets.hex2str(privateKey), NetworkType.MIJIN_TEST);

            const encryptedMessage: EncryptedMessage = account.encryptMessage(message, account.publicAccount);

            return encryptedMessage;
        }

    }

    /**
     * Creates a sharded private key that can encrypt messages.
     * @param numOfrecipients number of shares to be generated
     * @param threshold minimum number of shares needed to decrypt
     * @returns array of shares
     */
    public static createShardedPrivateKey(numOfrecipients: number, threshold: number, privateKey?: string): [any] {
        let privateKeyHex: string;
        let shares: [any];

        if (privateKey) {
            privateKeyHex = secrets.str2hex(privateKey);
            shares = secrets.share(privateKeyHex, numOfrecipients, threshold);
            return shares;
        }
        const account = Account.generateNewAccount(NetworkType.MIJIN_TEST);
        privateKeyHex = secrets.str2hex(account.privateKey);
        shares = secrets.share(privateKeyHex, numOfrecipients, threshold);
        return shares;
    }

    /**
     * Decrypts a given secret with a sufficent number of shares
     * @param messagePayload either a string or a PlainMessage
     * @param shardedPrivateKeyShares the shares required for decrypted (must meet the threshold)
     * @returns String
     */
    public static decrypt(messagePayload: string, shardedPrivateKeyShares: [any], threshold: number): PlainMessage {
        const privateKey = secrets.combine(shardedPrivateKeyShares.slice(0, threshold));
        const account = Account.createFromPrivateKey(secrets.hex2str(privateKey), NetworkType.MIJIN_TEST);
        const encryptedMessage: EncryptedMessage = EncryptedMessage.createFromDTO(messagePayload);
        return account.decryptMessage(encryptedMessage, account.publicAccount);
    }
}
