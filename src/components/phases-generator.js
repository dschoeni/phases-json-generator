import Web3 from 'web3';
import Datepicker from 'vuejs-datepicker';

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));

export default {
    name: 'PhaseGenerator',
    components: { Datepicker },
    template: `
        <div>
            <h2>Add Phase</h2>
            <div class="row">
                <div class="col-6">
                    Date: <br>
                    <datepicker v-model="date"></datepicker>
                </div>
                <div class="col-6">
                    USD/ETH: <br>
                    <input v-model="price" id="price" type="input" autocomplete="false">
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <h2>current phases.json</h2>
                    <textarea v-model="input" class="form-control" type="text" autocomplete="false"></textarea>
                </div>
                <div class="col-12">
                    <h2>updated (new) phases.json</h2>
                    <textarea v-model="outputJSON" class="form-control" type="text" autocomplete="false"></textarea>
                </div>
                <div class="col-12 mt-4">
                    <button class="btn btn-primary btn-block" @click="addPhase()" :disabled="!date || !price || isSearching">
                        Add Phase <i class="fa fa-spin fa-spinner" v-if="isSearching"></i>
                    </button>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-12">
                    <div class="alert alert-success" v-if="output">
                        The phases.json has been updated. 
                        <br><br>
                        From {{ usedDate }} (Block <a :href="'https://etherscan.io/block/' + output[output.length - 2].maxBlockHeight" target="_blank">#{{ output[output.length - 2].maxBlockHeight }}</a> ) onwards a price of {{ output[output.length - 1].ethUSDPrice }} USD/ETH will be used.
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        addPhase () {
            this.usedDate = new Date(this.date)

            this.usedDate.setSeconds(0)
            this.usedDate.setMinutes(0)
            this.usedDate.setHours(0)

            console.log('using', this.usedDate, 'as date')

            if (!this.date && typeof date === Date) {
                console.warn('no date supplied')
                // todo: error date
                return;
            }

            if (!this.price && this.price > 0) {
                console.warn('no price supplied')
                // todo: error price
                return;
            }

            let phases = JSON.parse(this.input)
            let lastPhase = phases[phases.length - 1]
            let lastPhaseWithBlockHeight = phases[phases.length - 2]

            this.isSearching = true;

            this.searchBlockNumber(this.usedDate, lastPhaseWithBlockHeight.maxBlockHeight).then(result => {
                lastPhase.maxBlockHeight = result

                phases.push({
                    "maxBlockHeight": "latest",
                    "tokenUSDPrice": 0.12,
                    "ethUSDPrice": this.price
                })
    
                this.output = phases
                this.outputJSON = JSON.stringify(phases)

                this.isSearching = false;
            }, error => {
                console.warn(error)
            })

        },
        searchBlockNumber (date, lastBlockHeight) {
            return new Promise((resolve, reject) => {
                let timeStampToSearchFor = date.getTime() / 1000
                let blockHeight = lastBlockHeight
                
                web3.eth.getBlock(lastBlockHeight).then(block => {
                    let timestamp = block.timestamp

                    console.log(timestamp, timeStampToSearchFor)
                    
                    // we got the new block
                    if (timestamp >= timeStampToSearchFor) {
                        console.log('found the block')
                        resolve(block.number)
                    } else {
                        resolve()
                    }

                }, error => {
                    console.warn(error)
                    reject(error)
                })
            }).then(newBlockHeight => {
                console.log(newBlockHeight)
                return newBlockHeight !== undefined ? newBlockHeight : this.searchBlockNumber(date, lastBlockHeight + 1000);
            });
        }
    },
    data: function () {
        return {
            usedDate: null,
            price: null,
            date: new Date(),
            input: null,
            output: null,
            outputJSON: null,
            isSearching: false
        }
    }
}
