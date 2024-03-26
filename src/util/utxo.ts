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

// Function to convert UTxO to SerializableUTxO
function toSerializableUTxO(utxo: UTxO): SerializableUTxO {
    return {
        ...utxo,
        assets: Object.fromEntries(
            Object.entries(utxo.assets).map(([key, value]) => [key, value.toString()])
        ) as SerializableAssets
    };
}

// Function to convert SerializableUTxO back to UTxO
function fromSerializableUTxO(serializableUTxO: SerializableUTxO): UTxO {
    return {
        ...serializableUTxO,
        assets: Object.fromEntries(
            Object.entries(serializableUTxO.assets).map(([key, value]) => [key, BigInt(value)])
        ) as Assets
    };
}

function serializeUtxos(utxos: UTxO[]) {
    return utxos.map(toSerializableUTxO)
}

function deserializeUtxos(sUtxos: SerializableUTxO[]) {
    return sUtxos.map(fromSerializableUTxO)
}

export {
    serializeUtxos,
    deserializeUtxos
}