import { Injectable } from '@nestjs/common';
import { Block } from '@cosmjs/stargate'; //defaultRegistryTypes
import { Cron, CronExpression } from '@nestjs/schedule';
import { StargateClient } from '@cosmjs/stargate';
import axios from 'axios';
import { sha256 } from '@cosmjs/crypto';
import { toHex } from '@cosmjs/encoding';
import { decodeTxRaw } from '@cosmjs/proto-signing'; //Registry
import { fromBase64 } from '@cosmjs/encoding';
import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

@Injectable()
export class GaiaCronService {
  //Cosmjs decode
  // _registry = new Registry(defaultRegistryTypes);
  newest_block: number;
  semaphore: boolean;
  current_sync_block: number;

  constructor() {
    this.semaphore = false;
    this.current_sync_block = this.getCurrentSyncBlock();
    this.getNewestBlockHeightFromNodePeriodic();
  }

  getBlockCosmjs = async (
    height: number,
    rcp: string,
  ): Promise<Block | undefined> => {
    try {
      const client = await StargateClient.connect(rcp);
      const response = await client.getBlock(height);

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  parseTxCosmjs = (tx: string, registry: any) => {
    const decoded = decodeTxRaw(fromBase64(tx));
    const parsedData = [];

    for (const message of decoded.body.messages) {
      const decodedMsg = registry.decode(message);
      parsedData.push(decodedMsg);
    }

    return parsedData;
  };

  getBlockHeight = async (height: number, rcp: string): Promise<any> => {
    try {
      console.log(`parsing block num: `, height);
      const response = await axios.get(
        `${rcp}/cosmos/base/tendermint/v1beta1/blocks/${height}`,
        {
          headers: {
            accept: 'application/json',
          },
        },
      );
      // const response = await axios.get('http://0.0.0.0:26657/block', {
      // params: {
      //     'height': height
      // },
      // headers: {
      //     'accept': 'application/json'
      // }
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  getTxByTxHash = async (tx_id: string, rpc: string): Promise<any> => {
    try {
      const response = await axios.get(
        `${rpc}/cosmos/tx/v1beta1/txs/${tx_id}`,
        {
          headers: {
            accept: 'application/json',
          },
        },
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  getCurrentSyncBlock = (): number => {
    // Reading current synced block
    const data = fs.readFileSync('current_sync_block.txt');
    console.log('currently synced still block: ' + data.toString());
    return Number(data);
  };

  saveCurrentSyncBlock = (block_height: number) => {
    // Reading current synced block
    fs.writeFile(
      'current_sync_block.txt',
      block_height.toString(),
      function (err) {
        if (err) {
          return console.error(err);
        }
      },
    );
  };

  getLatestBlockHeight = async (rpc: string): Promise<number> => {
    try {
      const response = await axios.get(`${rpc}/blocks/latest`, {
        headers: {
          accept: 'application/json',
        },
      });
      console.log(
        `Latest block height is: `,
        response.data.block.header.height,
      );
      return response.data.block.header.height;
    } catch (error) {
      console.log(error);
    }
  };
  //update latest node height every 12 hours
  @Cron(CronExpression.EVERY_12_HOURS)
  async getNewestBlockHeightFromNodePeriodic() {
    this.newest_block = await this.getLatestBlockHeight(
      process.env.COSMOS_NODE_ADDRESS,
    );
  }

  @Cron(CronExpression.EVERY_SECOND)
  async getNewBlock() {
    if (this.semaphore == true) {
      return;
    }
    //getting the semaphore
    this.semaphore = true;
    //because we can have many transactions in a block, many events in a transactions => so we append to an array and write to file when syncing process complete
    const arr_txs_row = [];
    const arr_events_row = [];

    const current_block_number: number = this.current_sync_block;
    //check if we get still the latest node's height => wait still receive new block
    if (current_block_number == this.newest_block) {
      await this.getNewestBlockHeightFromNodePeriodic();
      console.log('syncing completed, latest block: ', current_block_number);
      return;
    }

    //getting this block
    let getblock: any;
    try {
      getblock = await this.getBlockHeight(
        current_block_number,
        process.env.COSMOS_NODE_ADDRESS,
      );
    } catch (error) {
      console.error(error);
      return;
    } finally {
      if (!getblock) {
        console.log(
          'Error getting block from node!! please check node (connection).',
        );
      }
    }
    //getting require fields from block.
    const block_height = getblock.data.block.header.height;
    const block_timestamp = getblock.data.block.header.time;
    const chain_id = getblock.data.block.header.chain_id;
    const proposer_address = getblock.data.block.header.proposer_address;
    const validator_hash = getblock.data.block.header.validators_hash;

    const block_row =
      block_height +
      ',' +
      block_timestamp +
      ',' +
      chain_id +
      ',' +
      proposer_address +
      ',' +
      validator_hash +
      '\r\n';
    // console.log("block: ",block_row);

    const txs: string[] = getblock.data.block.data.txs;

    //check if there is any txs in this block, if not return
    if (txs.length != 0) {
      for (let i = 0; i < txs.length; i++) {
        // decode transaction hash from raw data
        const tx_id = toHex(sha256(Buffer.from(txs[i], 'base64')));
        const tx = await this.getTxByTxHash(
          tx_id,
          process.env.COSMOS_NODE_ADDRESS,
        );
        if (!tx) {
          console.log('failed to get tx!! check node!!');
          return;
        }

        //get transaction fields
        //block_height, chain_id, inherited from block
        //some actions doesn't require amount so we have this check
        let fee: number;
        // console.log(tx.data.tx.auth_info.fee.amount);

        if (!tx.data.tx.auth_info.fee.amount.length) {
          fee = 0;
        } else {
          fee = tx.data.tx.auth_info.fee.amount[0].amount;
        }
        //console.log(tx.data.tx.auth_info.fee);

        const { gas_used, gas_wanted, timestamp, code } = tx.data.tx_response;

        const transaction_row =
          block_height +
          ',' +
          chain_id +
          ',' +
          tx_id +
          ',' +
          `done` +
          ',' +
          fee +
          ',' +
          code +
          ',' + //tx_index
          i +
          ',' +
          gas_used +
          ',' +
          gas_wanted +
          ',' +
          timestamp +
          '\r\n';

        arr_txs_row.push(transaction_row);
        // console.log(transaction_row);
        // console.log(tx.data.tx_response.raw_log);

        let wraped_events;
        // reading events from transaction
        try {
          wraped_events = JSON.parse(tx.data.tx_response.raw_log);
        } catch (error) {
          console.error(
            `error parsing wrapped_events`,
            tx.data.tx_response.raw_log,
          );
          break;
        }

        // parse transaction's events to csv file
        // if there is no events, then smt is probably up with the transaction so we should skip it
        if (wraped_events[0].events.length != 0) {
          for (let index = 0; index < wraped_events[0].events.length; index++) {
            // console.log(wraped_events[0].events[index]);
            for (
              let j = 0;
              j < wraped_events[0].events[index].attributes.length;
              j++
            ) {
              const event_row =
                block_height +
                ',' +
                chain_id +
                ',' +
                tx_id +
                ',' +
                index +
                ',' +
                wraped_events[0].events[index].type +
                ',' +
                wraped_events[0].events[index].attributes[j].key +
                ',' +
                wraped_events[0].events[index].attributes[j].value +
                ',' +
                j +
                ',' +
                timestamp +
                '\r\n';

              // console.log(event_row);
              arr_events_row.push(event_row);
            }
          }
        }
      }
    }

    //parse block's data
    try {
      fs.appendFileSync('output_data/blocks.csv', block_row);
    } catch (error) {
      throw error;
    }
    //parse txs's data
    if (arr_txs_row.length != 0) {
      for (let i = 0; i < arr_txs_row.length; i++) {
        try {
          fs.appendFileSync('output_data/transactions.csv', arr_txs_row[i]);
        } catch (error) {
          throw error;
        }
      }
    }
    //parse events's data
    if (arr_events_row.length != 0) {
      for (let i = 0; i < arr_events_row.length; i++) {
        try {
          fs.appendFileSync(
            'output_data/event_attributes.csv',
            arr_events_row[i],
          );
        } catch (error) {
          throw error;
        }
      }
    }
    console.log('finished parsing block: ', current_block_number);

    this.saveCurrentSyncBlock(current_block_number + 1);
    this.current_sync_block = this.current_sync_block + 1;
    this.semaphore = false;
  }
}
