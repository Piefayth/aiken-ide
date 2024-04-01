import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Network } from 'lucid-cardano'

export type ProviderKind = 'blockfrost' | 'kupmios' | 'emulator'

interface BlockfrostProviderConfig {
    kind: 'blockfrost'
    apiKey: string
    url: string
}

interface KupmiosProviderConfig {
    kind: 'kupmios'
    kupoUrl: string
    ogmiosUrl: string
}

interface EmulatorConfig {
    kind: 'emulator'
}

type ProviderConfig = BlockfrostProviderConfig | KupmiosProviderConfig | EmulatorConfig

interface SettingsFormState {
    providerKind: ProviderKind
    network: Network | 'Emulator'
    blockfrost: BlockfrostProviderConfig
    kupmios: KupmiosProviderConfig
}

interface SettingsState {
    open: boolean
    network: Network
    providerConfig: ProviderConfig,
    form: SettingsFormState
}

const initialState: SettingsState = {
    open: false,
    network: 'Custom',
    providerConfig: {
        kind: 'emulator'
    },
    form: {
        providerKind: 'emulator',
        network: 'Emulator',
        blockfrost: {
            kind: 'blockfrost',
            apiKey: import.meta.env.VITE_BLOCKFROST_API_KEY || '',
            url: 'https://cardano-preview.blockfrost.io/api/v0'
        },
        kupmios: {
            kind: 'kupmios',
            kupoUrl: '',
            ogmiosUrl: ''
        },
    }
}

const settingsSlice = createSlice({
    name: 'tooltip',
    initialState,
    reducers: {
        toggleSettings: (state) => {
            state.open = !state.open
        },
        saveUpdatedSettings: (state) => {
            state.open = false
            state.network = state.form.network === 'Emulator' ? 'Custom' : state.form.network

            if (state.form.providerKind === 'blockfrost') {
                state.providerConfig = state.form.blockfrost
            } else if (state.form.providerKind === 'kupmios') {
                state.providerConfig = state.form.kupmios
            } else if (state.form.providerKind === 'emulator') {
                state.providerConfig = { kind: 'emulator' }
            } else {
                throw Error('not implemented')
            }
        },
        setFormProviderKind: (state, action: PayloadAction<ProviderKind>) => {
            state.form.providerKind = action.payload
        },
        setFormNetwork: (state, action: PayloadAction<Network | 'Emulator'>) => {
            state.form.network = action.payload

            if (state.form.network === 'Emulator' && state.form.providerKind !== 'emulator') {
                state.form.providerKind = 'emulator'
            }

            if (state.form.network !== 'Emulator' && state.form.providerKind === 'emulator') {
                state.form.providerKind = 'blockfrost'
            }
        },
        setBlockfrostConfig: (state, action: PayloadAction<BlockfrostProviderConfig>) => {
            state.form.blockfrost = action.payload
        },
        setKupmiosConfig: (state, action: PayloadAction<BlockfrostProviderConfig>) => {
            state.form.blockfrost = action.payload
        }
    }
})

export const {
    toggleSettings,
    saveUpdatedSettings,
    setFormProviderKind,
    setBlockfrostConfig,
    setKupmiosConfig,
    setFormNetwork
} = settingsSlice.actions
export default settingsSlice.reducer