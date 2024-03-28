import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { Mint, Payment, Spend, TransactState, onTransactionSubmission } from "../../../features/management/transactSlice"
import { File } from '../../../features/files/filesSlice'
import { SerializableAssets, deserializeAssets, deserializeUtxos, serializeAssets } from "../../../util/utxo"
import { Data, Emulator, Lucid } from "lucid-cardano"
import { useLucid } from "../../../components/LucidProvider"
import { Contract, Wallet } from "../../../features/management/managementSlice"
import { constructObject } from "../../../util/data"

function Submit() {
    const transactState = useSelector((state: RootState) => state.transact)
    const files = useSelector((state: RootState) => state.files.files)
    const {contracts, wallets} = useSelector((state: RootState) => state.management)
    const { mints, spends, payments } = transactState

    const dispatch = useDispatch()
    
    const { isLucidLoading, lucid: _lucid } = useLucid()
    const lucid = _lucid!!
    
    const atLeastOneInput = spends.length !== 0
    const atLeastOnePayment = payments.length !== 0
    const feedbackComponents = []

    if (!atLeastOneInput) {
        feedbackComponents.push(
            <div key='atLeastOneInput'>
                <span style={{color: '#ff9353'}}>⚠</span> Choose at least one UTxO to spend.
            </div>
        )
    }

    if (!atLeastOnePayment) {
        feedbackComponents.push(
            <div key='atLeastOnePayment'>
                <span style={{color: '#ff9353'}}>⚠</span> Make at least one payment.
            </div>
        )
    }

    if (!canAffordTotal(mints, spends, payments)) {
        feedbackComponents.push(
            <div key='bagTooSmall'>
                <span style={{color: '#ff9353'}}>⚠</span> Insufficient inputs to fund payments.
            </div>
        )
    }

    const wasThereAnyFeedback = feedbackComponents.length > 0
    if (!wasThereAnyFeedback) {
        feedbackComponents.push(
            <div key='readyToSubmit'>
                ✔️ Ready to submit.
            </div>
        )
    }

    return (
        <div className='transact-submit'>
            <div className='transact-feedback-display'>
                <div className='transact-feedback-heading'>Submission</div>
                {
                    feedbackComponents
                }
            </div>
            <div className='transact-submit-button-container'>
                <button
                    disabled={wasThereAnyFeedback}
                    className={`button submit-transaction-button ${wasThereAnyFeedback ? 'disabled' : ''}`}
                    onClick={() => {
                        submit(lucid, transactState, files, contracts, wallets)
                            .then((txhash) => {
                                if (lucid.network === 'Custom') {
                                    (lucid.provider as Emulator).awaitTx(txhash)
                                } else {
                                    return Promise.resolve()
                                }
                            })
                            .then(() => {
                                dispatch(onTransactionSubmission(transactState))
                                console.log("tx success")
                            })
                            .catch((e) => {
                                // handle error
                                console.log(e)
                                console.log("tx failure")
                            })
                    }}
                >Submit Transaction</button>
            </div>

        </div>
    )
}

// TODO: all the sad paths in here need to become user facing errors
async function submit(lucid: Lucid, transactState: TransactState, files: File[], contracts: Contract[], wallets: Wallet[]) {
    const { mints, spends, payments, extraSigners, validity, metadataFilename } = transactState

    const tx = lucid.newTx()

    for (const spend of spends) {
        const redeemerFile = files.find(file => file.name === spend.redeemerFileName)
        const doesSpendHaveRedeemer = spend.redeemerFileName && spend.redeemerFileName !== 'None'

        if (doesSpendHaveRedeemer && !redeemerFile) {
            console.error(`Could not find ${spend.redeemerFileName} to build redeemer`)
            throw Error("todo real error")
        }

        if (spend.source === 'contract') {
            const spendFromAddress = spend.utxos[0].address
            const contract = contracts.find(contract => contract.address === spendFromAddress)
            if (!contract) {
                console.error(`Could not find script address ${spendFromAddress} in contracts.`)
                throw Error("todo real error")
            }

            tx.attachSpendingValidator(contract.script)
        }

        let redeemer
        if (doesSpendHaveRedeemer && redeemerFile) {
            try {
                const redeemerJson = JSON.parse(redeemerFile.content)
                redeemer = constructObject(redeemerJson)
            } catch (e) {
                console.error(e)
                throw Error("todo real error")
            }
        }

        if (redeemer) {
            tx.collectFrom(deserializeUtxos(spend.utxos), Data.to(redeemer))
        } else {
            tx.collectFrom(deserializeUtxos(spend.utxos))
        }
    }

    for (const mint of mints) {
        const redeemerFile = files.find(file => file.name === mint.redeemerFileName)
        const doesMintHaveRedeemer = mint.redeemerFileName && mint.redeemerFileName !== 'None'

        if (doesMintHaveRedeemer && !redeemerFile) {
            console.error(`Could not find ${mint.redeemerFileName} to build redeemer`)
            throw Error("todo real error")
        }

        const contract = contracts.find(contract => contract.scriptHash === mint.policyId)
        if (!contract) {
            console.error(`Could not find script address ${mint.policyId} in contracts`)
            throw Error("todo real error")
        }

        tx.attachMintingPolicy(contract.script)

        let redeemer
        if (doesMintHaveRedeemer && redeemerFile) {
            try {
                const redeemerJson = JSON.parse(redeemerFile.content)
                redeemer = constructObject(redeemerJson)
                
                console.log(redeemer)
            } catch (e) {
                console.error(e)
                throw Error("todo real error")
            }
        }

        if (redeemer) {
            tx.mintAssets(deserializeAssets(mint.assets), Data.to(redeemer))
        } else {
            tx.mintAssets(deserializeAssets(mint.assets))
        }
    }

    for (const payment of payments) {
        const datumFile = files.find(file => file.name === payment.datumFileName)
        const doesPaymentHaveDatum = payment.datumFileName && payment.datumFileName !== 'None'

        if (doesPaymentHaveDatum && !datumFile) {
            console.error(`Could not find ${payment.datumFileName} to build datum`)
            throw Error("todo real error")
        }

        let datum
        if (doesPaymentHaveDatum && datumFile) {
            try {
                const datumJson = JSON.parse(datumFile.content)
                datum = constructObject(datumJson)
            } catch(e) {
                console.error(e)
                throw Error("todo real error")
            }
        }

        if (datum) {
            tx.payToAddressWithData(payment.toAddress, Data.to(datum), deserializeAssets(payment.assets))
        } else {
            tx.payToAddress(payment.toAddress, deserializeAssets(payment.assets))
        }
    }

    for (const signerAddress of extraSigners) {
        tx.addSigner(signerAddress)
    }

    if (validity.from) {
        tx.validFrom(new Date(validity.from).valueOf())
    }

    if (validity.to) {
        tx.validTo(new Date(validity.to).valueOf())
    }

    const doesTransactionHaveMetadata = metadataFilename && metadataFilename !== 'None'
    if (doesTransactionHaveMetadata) {
        const metadataFile = files.find(file => file.name === metadataFilename)
        
        if (!metadataFile) {
            console.error(`Could not find metadata file ${metadataFilename}`)
            throw Error("todo real error")
        }

        let metadata
        try {
            metadata = JSON.parse(metadataFile.content)
        } catch (e) {
            console.error(e)
            throw Error("todo real error")
        }

        for (const maybeLabel of Object.keys(metadata)) {
            try {
                const labelNumber = parseInt(maybeLabel)
                tx.attachMetadata(labelNumber, metadata[maybeLabel])
            } catch (e) {
                console.error(`Expected numeric label key in metadata, instead received key ${maybeLabel}`)
                throw Error("todo real error")
            }
        }
    }

    const unsignedTx = await tx.complete()

    const walletSpendAddresses = spends
        .filter(spend => spend.source === 'wallet')
        .map(spend => spend.utxos[0].address)

    for (const signerAddress of extraSigners) {
        if (walletSpendAddresses.includes(signerAddress)) {
            continue
        }

        const signerWallet = wallets.find(wallet => wallet.address === signerAddress)

        if (!signerWallet) {
            console.error(`Could not find wallet for address ${signerAddress}`)
            throw Error("todo real error")
        }

        lucid.selectWalletFromSeed(signerWallet.seed)
        unsignedTx.partialSign()
    }

    for (const walletSpendAddress of walletSpendAddresses) {
        const spendingWallet = wallets.find(wallet => wallet.address === walletSpendAddress)

        if (!spendingWallet) {
            console.error(`Could not find wallet for adress ${walletSpendAddress}`)
            throw Error("todo real error")
        }
        
        lucid.selectWalletFromSeed(spendingWallet.seed)
        await unsignedTx.partialSign()
    }
    
    const signedTx = await unsignedTx.complete()

    const submitted = signedTx.submit()

    await submitted 

    return signedTx.toHash()
}

function canAffordTotal(mints: Mint[], spends: Spend[], payments: Payment[]) {
    const mintAssets = mints.reduce((acc: SerializableAssets, cur: Mint) => {
        Object.entries(cur.assets).forEach(([assetName, amount]) => {
            if (acc[assetName]) {
                acc[assetName] = (BigInt(acc[assetName]) + BigInt(amount)).toString()
            } else {
                acc[assetName] = amount.toString()
            }
        })
        return acc
    }, {} as SerializableAssets)

    const allSpendableAssets = spends
        .flatMap(spend => spend.utxos)
        .reduce((acc, cur) => {
            Object.entries(cur.assets).forEach(([assetName, amount]) => {
                if (acc[assetName]) {
                    acc[assetName] = (BigInt(acc[assetName]) + BigInt(amount)).toString()
                } else {
                    acc[assetName] = amount.toString()
                }
            })
            return acc
        }, mintAssets as SerializableAssets)

    const canAfford = (() => {
        const totalAssetCost = payments.reduce((acc, cur) => {
            Object.keys(cur.assets).forEach(assetName => {
                if (!acc[assetName]) {
                    acc[assetName] = '0'
                }
                acc[assetName] = (BigInt(acc[assetName]) + BigInt(cur.assets[assetName])).toString();
            });
            return acc
        }, {} as SerializableAssets)

        return Object.keys(totalAssetCost).every(assetName =>
            BigInt(allSpendableAssets[assetName] || '0') >= BigInt(totalAssetCost[assetName])
        )
    })()

    return canAfford
}

export { Submit }