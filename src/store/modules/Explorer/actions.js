import Vue from 'vue';
import Config from '@/config';

const actions = {
    explorerLoad: ({ state, dispatch, commit }) => {

        dispatch('updateExplorer');
        if (!state.updateTimer) {

            let updateTimer = setInterval(() => {

                if (!state.updateLoading) {

                    dispatch('updateExplorer');
                }

            }, Config.updateInterval);
            commit('setUpdateTimer', updateTimer);
        }
    },
    explorerUnload: ({ state, dispatch, commit }) => {

    },
    updateExplorer: ({ commit, dispatch, state }) => {

        return state.explorerService.getInfo().then((networkInfo) => {

            // Check if tx pool size or height changed.
            let heightChanged = state.networkInfo.height != networkInfo.height;
            let txPoolChanged = heightChanged || state.networkInfo.tx_pool_size != networkInfo.tx_pool_size;

            if (heightChanged) {

                commit('setNetworkInfo', networkInfo);
                dispatch('getRecentBlocks');
                dispatch('getGeneratedCoins');
            }
            if (txPoolChanged) {

                dispatch('getTxPool');
            }
        }).catch((err) => {

            console.log('getInfo error', err);
        });
    },
    getGeneratedCoins: ({ commit, state }) => {

        return state.explorerService.getGeneratedCoins().then((coins) => {
            
            // Supply is now returned as regualar deciman number so change it to atomic units by multiplying by 1000000000000
            commit('setGeneratedCoins', coins * 1000000000000);
        }).catch((err) => {

            console.log('get generated coins error');
        });
    },
    getRecentBlocks: ({ commit, state }) => {

        let endBlock = state.networkInfo.height || 1;
        let startBlock = endBlock - 90;
        if (startBlock < 0) {

            startBlock = 0;
        }
        return state.explorerService.getBlockHeaders({
            start: startBlock,
            end: endBlock - 1
        }).then((blockHeaders) => {

            if (blockHeaders.headers) {

                commit('setRecentBlocks', blockHeaders.headers);
            }

        }).catch((err) => {

            console.log('get recent blocks error', err);
        });
    },
    getTxPool: ({ commit, dispatch, state }) => {

        return state.explorerService.getTxPool().then((txPool) => {

            commit('setTxPool', txPool.transactions || []);
        }).catch((err) => {

            console.log('tx pool error', err);
        });
    }
};

export default actions;
