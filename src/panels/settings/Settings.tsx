import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { ProviderKind, setBlockfrostConfig, setFormNetwork, setFormProviderKind, saveUpdatedSettings, toggleSettings } from "../../features/settings/settingsSlice"
import './Settings.css'
import { capitalize } from "../../util/strings"
import { Blockfrost, Lucid, Network } from "lucid-cardano"
import { clearWallets } from "../../features/management/managementSlice"
import { useState } from "react"



function Settings() {
    const [isSaving, setIsSaving] = useState(false)
    const [savingError, setSavingError] = useState('')
    const settings = useSelector((state: RootState) => state.settings)
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
                            type='text'
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
        <div>
            {settings.open && (
                <div className="modal-overlay" onClick={() => dispatch(toggleSettings())}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <span className='settings-header'>
                            Settings
                            { isSaving ? <div className="lds-ring"><div></div><div></div><div></div><div></div></div> : null }
                        </span>
                        { warning ? <span className='settings-warning'>{ warning }</span> : null }
                        <span className='settings-error'>{ savingError }</span>
                        <div className='settings-section-header'>
                            Provider
                        </div>

                        <div className='setting'>
                            <div className='input-label'>Network</div>
                            <select
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
                                            .then(() => {
                                                // new settings are good
                                                if (settings.providerConfig.kind === 'emulator' && settings.form.providerKind !== 'emulator') {
                                                    // reset all wallets when switching between live and emulated networks
                                                    // what happens when we switch between live networks? can we just regenerate the addresses?
                                                    dispatch(clearWallets())
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

                            <button
                                onClick={() => dispatch(toggleSettings())}
                                className="button settings-close-button"
                            >Cancel</button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export { Settings }