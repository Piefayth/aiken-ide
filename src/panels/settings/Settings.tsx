import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { ProviderKind, setBlockfrostConfig, setFormNetwork, setFormProviderKind, saveUpdatedSettings } from "../../features/settings/settingsSlice"
import './Settings.css'
import { capitalize } from "../../util/strings"
import { Blockfrost, Lucid, Network } from "lucid-cardano"
import { clearWallets, updateWalletAndContractAddresses } from "../../features/management/managementSlice"
import { useState } from "react"


function Settings() {
    const [isSaving, setIsSaving] = useState(false)
    const [savingError, setSavingError] = useState('')
    const settings = useSelector((state: RootState) => state.settings)
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const contracts = useSelector((state: RootState) => state.management.contracts)
    const dispatch = useDispatch()

    const networks: (Network | 'Emulator')[] = ['Emulator', 'Preview', 'Preprod', 'Mainnet']
    const providerKinds: ProviderKind[] = (() => {
        if (settings.form.network === 'Emulator') {
            return ['emulator']
        } else {
            return ['blockfrost']//, 'kupmios']
        }
    })()

    const providerSpecificForm = (() => {
        if (settings.form.providerKind === 'emulator') {
            return (<div></div>)
        } else if (settings.form.providerKind === 'blockfrost') {
            return (
                <div className='settings-subsection'>
                    <div className='setting'>
                        <div className='input-label'>API Key</div>
                        <input
                            className='text-input'
                            type='password'
                            value={settings.form.blockfrost.apiKey}
                            onChange={(e) => {
                                dispatch(setBlockfrostConfig({
                                    ...settings.form.blockfrost,
                                    apiKey: e.target.value
                                }))
                            }}
                        />
                    </div>

                    <div className='setting'>
                        <div className='input-label'>API URL</div>
                        <input
                            type='text'
                            className='text-input'
                            value={settings.form.blockfrost.url}
                            onChange={(e) => {
                                dispatch(setBlockfrostConfig({
                                    ...settings.form.blockfrost,
                                    url: e.target.value
                                }))
                            }}
                        />
                    </div>

                </div>
            )
        } else {
            return (<div>Kupmios Settings</div>)
        }
    })()

    const warning = (() => {
        if (
            (settings.providerConfig.kind === 'emulator' && settings.form.providerKind !== 'emulator') ||
            (settings.providerConfig.kind !== 'emulator' && settings.form.providerKind === 'emulator')
        ) {
            return 'Changing between emulated and live networks will clear the list of registered wallets and any emulator state.'
        }

        return ''
    })()

    return (
        <div className='management-content-scroll-exclusion-wrapper'>
            <div className='management-content management-section-shadow settings-content'>
                <div className='settings flex-column'>
                    <span className='management-section-heading'>
                        Settings
                        {isSaving ? <div className="lds-ring"><div></div><div></div><div></div><div></div></div> : null}
                    </span>
                    {warning ? <span className='settings-warning'>{warning}</span> : null}
                    <span className='settings-error'>{savingError}</span>
                    <div className='settings-section'>
                        <div className='settings-section-header'>
                            Provider
                        </div>
                        <div className='settings-section-settings'>
                            <div className='setting'>
                                <div className='input-label'>Network</div>
                                <select
                                    className='select'
                                    value={settings.form.network}
                                    onChange={(e) => {
                                        dispatch(setFormNetwork(e.target.value as Network | 'Emulator'))
                                    }}
                                >
                                    {
                                        networks.map(network => {
                                            return (
                                                <option
                                                    key={network}
                                                    value={network}
                                                >
                                                    {network}
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                            <div className='setting'>
                                <div className='input-label'>Provider Type</div>
                                <select
                                    className='select'
                                    value={settings.form.providerKind}
                                    onChange={(e) => {
                                        dispatch(setFormProviderKind(e.target.value as ProviderKind))
                                    }}
                                >
                                    {
                                        providerKinds.map(providerKind => {
                                            return (
                                                <option
                                                    key={providerKind}
                                                    value={providerKind}
                                                >
                                                    {capitalize(providerKind)}
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                            </div>

                            {providerSpecificForm}

                            <div className='settings-form-buttons'>

                                <button
                                    onClick={() => {
                                        setSavingError('')
                                        if (settings.form.providerKind === 'blockfrost') {
                                            setIsSaving(true)
                                            // we create a throwaway lucid to verify that the settings provided actually work before saving them
                                            Lucid.new(
                                                new Blockfrost(
                                                    settings.form.blockfrost.url,
                                                    settings.form.blockfrost.apiKey
                                                ),
                                                settings.form.network === 'Emulator' ? 'Custom' : settings.form.network
                                            )
                                                .then((lucid: Lucid) => {
                                                    // new settings are good
                                                    if (settings.providerConfig.kind === 'emulator' && settings.form.providerKind !== 'emulator') {
                                                        // reset all wallets when switching between live and emulated networks
                                                        dispatch(clearWallets())
                                                    }

                                                    if (
                                                        (settings.network === 'Mainnet' && settings.form.network !== 'Mainnet') ||
                                                        (settings.network !== 'Mainnet' && settings.form.network === 'Mainnet')
                                                    ) {
                                                        const oldAddressToNewAddressMap: Record<string, string> = {}

                                                        for (const contract of contracts) {
                                                            oldAddressToNewAddressMap[contract.address] = lucid.utils.validatorToAddress(contract.script)
                                                        }

                                                        for (const wallet of wallets) {
                                                            oldAddressToNewAddressMap[wallet.address] = lucid.utils.credentialToAddress(
                                                                lucid.utils.keyHashToCredential(wallet.pkh),
                                                                lucid.utils.stakeCredentialOf(wallet.address)
                                                            )
                                                        }

                                                        dispatch(updateWalletAndContractAddresses(oldAddressToNewAddressMap))
                                                    }
                                                    dispatch(saveUpdatedSettings())
                                                })
                                                .catch((e) => {
                                                    setSavingError('Unable to retrive protocol params from new provider. Check your settings?')
                                                    console.error(e.message)
                                                })
                                                .finally(() => {
                                                    setIsSaving(false)
                                                })
                                        } else if (settings.form.providerKind === 'emulator') {
                                            if (settings.providerConfig.kind !== 'emulator' && settings.form.providerKind === 'emulator') {
                                                // reset all wallets when switching between live and emulated networks
                                                dispatch(clearWallets())
                                            }
                                            dispatch(saveUpdatedSettings())
                                        } else {
                                            throw Error('not implemented')
                                        }
                                    }}
                                    className="button settings-save-button"
                                >Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { Settings }