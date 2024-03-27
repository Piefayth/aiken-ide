import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { setExtraSigners, setMetadata, setValidityInterval } from "../../../features/management/transactSlice"
import { shortenAddress } from "../../../util/strings"

function Extras() {
    const dispatch = useDispatch()
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const files = useSelector((state: RootState) => state.files.files)
    const extraSignerAddresses = useSelector((state: RootState) => state.transact.extraSigners)
    const validityInterval = useSelector((state: RootState) => state.transact.validity)
    const metadataFilename = useSelector((state: RootState) => state.transact.metadataFilename)

    const jsonChoices = ['None']
        .concat(
            files
                .filter(file => file.type === 'json')
                .map(file => file.name)
        )

    return (
        <div className='transact-section transact-section-extra'>
            <div className='transact-spend-header'>Extras</div>
            <div className='transact-extras-container'>
                <div className='extra-signers-container'>
                    <div className='input-label'>Extra Signers
                        <span style={{ 'fontWeight': 'normal', fontSize: 10 }}> (Ctrl / Cmd Click to remove)</span>
                    </div>
                    <div className='extra-signers-input-container'>
                        <select
                            multiple
                            className='select select-multiple'
                            value={extraSignerAddresses}
                            onChange={(e) => {
                                const options = e.target.options;
                                const extraSigners = [];
                                for (let i = 0, l = options.length; i < l; i++) {
                                    if (options[i].selected) {
                                        extraSigners.push(options[i].value);
                                    }
                                }
                                dispatch(setExtraSigners(extraSigners))
                            }}
                        >
                            {
                                wallets.map(wallet => {
                                    return (
                                        <option
                                            value={wallet.address}
                                            key={wallet.address}
                                        >
                                            {shortenAddress(wallet.address)}
                                        </option>
                                    )
                                })
                            }
                        </select>
                    </div>
                </div>

                <div className='validity-container'>
                    <div className='input-label'>Valid From</div>
                    <input
                        type='datetime-local'
                        onChange={(e) => {
                            dispatch(setValidityInterval({
                                ...validityInterval,
                                from: e.target.value
                            }))
                        }}
                    />

                </div>

                <div className='validity-container'>
                    <div className='input-label'>Valid To</div>
                    <input
                        type='datetime-local'
                        onChange={(e) => {
                            dispatch(setValidityInterval({
                                ...validityInterval,
                                from: e.target.value
                            }))
                        }}
                    />
                </div>

                <div className='validity-container'>
                    <div className='input-label'>Metadata</div>
                    <select
                        value={metadataFilename}
                        onChange={(e) => {
                            dispatch(setMetadata(e.target.value))
                        }}
                    >
                        {
                            jsonChoices.map(filename => {
                                return (
                                    <option
                                        value={filename}
                                        key={filename}
                                    >
                                        {filename}
                                    </option>
                                )
                            })
                        }
                    </select>
                </div>
            </div>
        </div>
    )
}

export { Extras }