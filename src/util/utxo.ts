import { Address, Assets, Datum, DatumHash, Script, TxHash, UTxO, Unit } from "lucid-cardano";

export declare type SerializableUTxO = {
    txHash: TxHash;
    outputIndex: number;
    assets: SerializableAssets;
    address: Address;
    datumHash?: DatumHash | null;
    datum?: Datum | null;
    scriptRef?: Script | null;
};

export declare type SerializableAssets = Record<Unit | "lovelace", string>;

function toSerializableUTxO(utxo: UTxO): SerializableUTxO {
    return {
        ...utxo,
        assets: Object.fromEntries(
            Object.entries(utxo.assets).map(([key, value]) => [key, value.toString()])
        ) as SerializableAssets
    };
}

function fromSerializableUTxO(serializableUTxO: SerializableUTxO): UTxO {
    return {
        ...serializableUTxO,
        assets: Object.fromEntries(
            Object.entries(serializableUTxO.assets).map(([key, value]) => [key, BigInt(value)])
        ) as Assets
    };
}

function serializeAssets(assets: Assets): SerializableAssets {
    return Object.fromEntries(
        Object.entries(assets).map(([key, value]) => [key, value.toString()])
    ) as SerializableAssets;
}

function deserializeAssets(serializableAssets: SerializableAssets): Assets {
    return Object.fromEntries(
        Object.entries(serializableAssets).map(([key, value]) => [key, BigInt(value)])
    ) as Assets;
}


function serializeUtxos(utxos: UTxO[]) {
    return utxos.map(toSerializableUTxO)
}

function deserializeUtxos(sUtxos: SerializableUTxO[]) {
    return sUtxos.map(fromSerializableUTxO)
}

function sumAssets(assetsArray: Assets[]): Assets {
    const totalAssets: Assets = {};

    for (const assets of assetsArray) {
        for (const [unit, amount] of Object.entries(assets)) {
            if (totalAssets[unit]) {
                totalAssets[unit] += BigInt(amount);
            } else {
                totalAssets[unit] = BigInt(amount);
            }
        }
    }

    return totalAssets;
}

function isSameUtxo(utxo1: UTxO, utxo2: UTxO) {
    return utxo1.txHash === utxo2.txHash && utxo1.outputIndex === utxo2.outputIndex
}


export {
    serializeUtxos,
    deserializeUtxos,
    serializeAssets,
    deserializeAssets,
    sumAssets,
    isSameUtxo
}