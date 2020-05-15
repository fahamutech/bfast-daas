import * as bcrypt from 'bcrypt';
import * as _jwt from "jsonwebtoken";
import {SecurityAdapter} from "../adapter/SecurityAdapter";
import {ConfigAdapter} from "../config";
import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {Database} from "./Database";

let _jwtPassword =
    `MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFg6797ocIzEPK
mk96COGGqySke+nVcJwNvuGqynxvahg6OFHamg29P9S5Ji73O1t+3uEhubv7lbaF
f6WA1xnLzPSa3y3OdkFDUt8Px0SwnSJRxgNVG2g4gT6pA/huuJDuyleTPUKAqe/4
Ty/jbmj+dco+nTXzxo2VDB/uCGUTibPE7TvuAG3O5QbYVM2GBEPntha8L3IQ9GKc
0r+070xbqPRL5mKokySTm6FbCT2hucL4YlOWAfkdCYJp64up8THbsMBi1e9mUgwl
8etXcs2z0UybQSQzA4REy+3qmIIvZ3m9xLsNGAVcJ7aXkfPSajkYvvVJFXmz35Nh
bzrJW7JZAgMBAAECggEABAX9r5CHUaePjfX8vnil129vDKa1ibKEi0cjI66CQGbB
3ZW+HRzcQMmnFKpxdHnSEFCL93roGGThVfDWtzwqe1tOdEUtkrIX/D4Y6yJdBNf+
lfnZoYcwZU5Er360NdUupp6akBZEX4i 878765iufiy 6c76375wi ogiyurv76
iuyo8tiutititign giufygyituugWqdE7IX/jRaOynfnn2nJl+e5ITDoBjRdMi
yZcg4fhWMw9NGoiv21R1oBX5TibPE7TvuAG3O5QbYVM2GBEPntha8L3IQ9GKci8y
0r+070xbqPRL5mKokySTm6FbCT2hucL4YlOWAfkdCYJp64up8THbsMBi1e9mUgwl
8etXcs2z0UybQSQzA4REy+3qmIIvZ3m9xLsNGAVcJ7aXkfPSajkYvvVJFXmz35Nh
bzrJW7JZAgMBAAECggEABAX9r5CHUaePjfX8vnil129vDKa1ibKEi0cjI66CQGbB
3ZW+HRzcQMmnFKpxdHnSiruupq+MwnYoSvDv21hfCfkQDXvppQkXe72S+oS2vrJr
JLcWQ6hFDpecIaaCJiqAXvFACr`;

let database: DatabaseAdapter;

export class Security implements SecurityAdapter {

    constructor(private readonly config: ConfigAdapter) {
        database = (config.adapters && config.adapters.database) ?
            config.adapters.database(config) : new Database(config)
    }

    async comparePassword(plainPassword: string, hashPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(plainPassword, hashPassword);
        } catch (e) {
            console.error(e);
            throw e.toString();
        }
    }

    async hashPlainText(plainText: string): Promise<string> {
        try {
            return await bcrypt.hash(plainText, 5);
        } catch (e) {
            console.error(e);
            throw e.toString();
        }
    }

    async revokeToken(token: string): Promise<any> {
        return {message: 'Token revoked', value: false};
        // return new Promise((resolve, reject) => {
        //     _redisClient.del(token, (err, reply) => {
        //         if (err) {
        //             reject({
        //                 message: 'Fails to revoke a token',
        //                 reason: err.toString()
        //             });
        //             return;
        //         }
        //         resolve({message: 'Token revoked', value: reply});
        //     });
        // });
    }

    async generateToken(data: { uid: string, [key: string]: any }, expire?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            _jwt.sign(data, _jwtPassword, {
                expiresIn: expire ? expire : '7d',
                issuer: 'bfast::cloud'
            }, async (err, encoded) => {
                if (err) {
                    reject({message: 'Fails to generate a token', reason: err.toString()});
                    return;
                }

                await database.writeOne('_Token', {
                    _id: data.uid,
                    token: encoded,
                }, null, {
                    bypassDomainVerification: true,
                    indexes: [
                        {
                            field: 'token',
                            unique: true,
                        },
                        {
                            field: '_created_at',
                            expireAfterSeconds: Security.dayToSecond(expire)
                        },
                    ]
                });
                resolve(encoded);
            });
        });
    }

    async verifyToken<T>(token: string): Promise<T> {
        return new Promise((resolve, reject) => {
            _jwt.verify(token, _jwtPassword, {
                issuer: 'bfast::cloud'
            }, (err, decoded: any) => {
                if (err) {
                    reject({message: 'Fails to verify token', reason: err.toString()});
                } else {
                    const data = JSON.parse(JSON.stringify(decoded));
                    if (data && data.uid) {
                        resolve(data);
                    } else {
                        reject({message: 'Invalid data in token'});
                    }
                }
            });
        });
    }

    decodeToken(token: string): any {
        return _jwt.decode(token, {
            complete: true,
            json: true
        });
    }

    private static dayToSecond(day: string) {
        const days = day ? day : '7d';
        const daysInNumber = days.replace('d', '') as unknown as number;
        return (daysInNumber * 86400);
    }
}
