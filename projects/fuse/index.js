/*==================================================
  Modules
  ==================================================*/

  const sdk = require('../../sdk');
  
  /*==================================================
  Constants
  ==================================================*/
  
  const tokenAddresses = [
    '0x67C5870b4A41D4Ebef24d2456547A03F1f3e094B'  //G$
  ];
  const ambBridgeContract = "0xf301d525da003e874DF574BCdd309a6BF0535bb6"
  const gDollarBridgeContract = "0xD5D11eE582c8931F336fbcd135e98CEE4DB8CCB0"

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let balances = {
      '0x0000000000000000000000000000000000000000': '0'
    };
    
    const allTokens = await sdk.api.util.tokenList();

    const balanceOfAmbBridge = block > 10860976
      ? await sdk.api.abi.multiCall({
        block,
        calls: _.map(allTokens, (token) => ({
          target: token.contract,
          params: ambBridgeContract
        })),
        abi: 'erc20:balanceOf'
      })
      : { output: [] };
      
    const balanceOfGdollarBridge = block > 11238178
      ? await sdk.api.abi.multiCall({
        block,
        calls: _.map(tokenAddresses, (token) => ({
          target: token,
          params: gDollarBridgeContract
        })),
        abi: 'erc20:balanceOf'
      })
      : { output: [] };
    
    const output = [
      ...balanceOfAmbBridge.output,
      ...balanceOfGdollarBridge.output
    ];

    _.each(output, (balanceOf) => {
      if(balanceOf.success) {
        const balance = balanceOf.output;
        const address = balanceOf.input.target;
        if (balance === '0') {
          return;
        }
        if (!balances[address]) {
          balances[address] = balance;
        } else {
          balances[address] = new BigNumber(balances[address]).plus(new BigNumber(balance)).toFixed();
        }
      }
    });


    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Fuse',
    token: FUSE,
    category: 'Payments',
    start: 1600097979, //AMB bridge creation time
    tvl
  }
