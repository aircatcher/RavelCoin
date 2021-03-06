const SHA256 = require('crypto-js/sha256');

class Transaction
{
    constructor(fromAddr, toAddr, amount)
    {
        this.fromAddr = fromAddr;
        this.toAddr = toAddr;
        this.amount = amount;
    }
}

class Block
{
    constructor(timestamp, transactions, prevHash = '')
    {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calcHash;
        this.nonce = 0;
    }

    // Calculate the hash
    calcHash()
    {
        return SHA256(this.index + this.prevHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    // Blockchain's proove of work
    // Also blockchain diffs or difficulty, for mining
    mineBlock(diff)
    {
        // Begin the hash with a certain amount of zeros
        while( this.hash.toString().substring(0,diff) !== Array(diff+1).join("0") )
        {
            // Increment as long as the has doesn't start with enough zeros
            // This also prevents infinite while loop
            // How many zeros in the beginning of the hash is equals to the difficulty value
            this.nonce++;

            this.hash = this.calcHash();
        }

        console.log("Mined block: " + this.hash);
    }
}

class Blockchain
{
    constructor()
    {
        this.chain = [this.createGenesisBlock()];
        this.diff = 2;  // Set the blockchain difficulty
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock()
    {
        return new Block("01/01/2018", "Genesis Block", "0");
    }

    pendingMiningTransactions(miningRewardAddr)
    {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.diff);

        console.log('Block was mined successfully');
        this.chain.push(block);

        // Reset the pending transactions array
        // and create a new transaction
        // then give the mining award to the miner
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddr, this.miningReward)
        ];
    }

    createTransaction(transaction)
    {
        this.pendingTransactions.push(transaction);
    }

    // Checks the balance of an address
    getAddrBalance(address)
    {
        let balance = 0;
        for(const block of this.chain)
        {
            for(const trans of block.transactions)
            {
                if(trans.fromAddr === address)
                    balance -= trans.amount;
                if(trans.toAddr === address)
                    balance += trans.amount;
            }
        }

        return balance;
    }

    // Adding a new block onto the chain
    addBlock(newBlock)
    {
        // Set the previous hash property of the new block
        newBlock.prevHash = this.getLatestBlock().hash;

        // Recalculate the Hash
        // newBlock.hash = newBlock.calcHash();

        // Create the new Mining Block with the difficulty
        newBlock.mineBlock(this.diff);

        // Push to the chain
        // In reality adding block is not that easy, as there is numerous of checks in the chain
        this.chain.push(newBlock);
    }

    // Check if the chain is valid
    isChainValid()
    {
        for(let i = 1; i < this.chain.length; i++)
        {
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];

            // Chcek if the hash of the current block is not equal to current calculated block hash
            if(currentBlock.hash !== currentBlock.calcHash())
                return false;

            // Check if the current block points to the previous block correctly
            if(currentBlock.prevHash !== prevBlock.hash)
                return false;
        }

        return true;
    }
}

let ravelCoin = new Blockchain();

ravelCoin.createTransaction(new Transaction('address1', 'address2', 100));
ravelCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting miner ...');
ravelCoin.pendingMiningTransactions('test-addr');
console.log('Balance of test is', ravelCoin.getAddrBalance('test-addr'));

console.log('\n Starting miner 2nd ...');
ravelCoin.pendingMiningTransactions('test-addr');
console.log('Balance of test is', ravelCoin.getAddrBalance('test-addr'));

// console.log('Mining block 1 ...')
// ravelCoin.addBlock(new Block(1, "10/07/2018", {amount: 4}));

// console.log('Mining block 2 ...')
// ravelCoin.addBlock(new Block(1, "12/07/2018", {amount: 7}));

// console.log(JSON.stringify(ravelCoin, null, 4));
// console.log('Is the Blockchain valid? ', + ravelCoin.isChainValid());

// Data tampering
// ravelCoin.chain[1].data = { amount: 100 };
// console.log('Is the Blockchain valid? ', + ravelCoin.isChainValid());

// Data tampering with recalculation
// ravelCoin.chain[1].data = { amount: 100 };
// ravelCoin.chain[1].data = ravelCoin.chain[1].calcHash();
// console.log('Is the Blockchain valid? ', + ravelCoin.isChainValid());