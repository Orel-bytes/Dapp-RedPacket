/*

  Copyright 2018 Wanchain Foundation.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

//                            _           _           _
//  __      ____ _ _ __   ___| |__   __ _(_)_ __   __| | _____   __
//  \ \ /\ / / _` | '_ \ / __| '_ \ / _` | | '_ \@/ _` |/ _ \ \ / /
//   \ V  V / (_| | | | | (__| | | | (_| | | | | | (_| |  __/\ V /
//    \_/\_/ \__,_|_| |_|\___|_| |_|\__,_|_|_| |_|\__,_|\___| \_/
//
//  Code style according to: https://github.com/wanchain/wanchain-token/blob/master/style-guide.rst

pragma solidity ^0.4.24;

/**
 * Math operations with safety checks
 */
library SafeMath {

    /**
    * @dev Multiplies two numbers, reverts on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    /**
    * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0); // Solidity only automatically asserts when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
    * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
    * @dev Adds two numbers, reverts on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
    * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
    * reverts when dividing by zero.
    */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}

/// @dev `Owned` is a base level contract that assigns an `owner` that can be
///  later changed
contract Owned {

    /// @dev `owner` is the only address that can call a function with this
    /// modifier
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    address public owner;

    /// @notice The Constructor assigns the message sender to be `owner`
    function Owned() public {
        owner = msg.sender;
    }

    address public newOwner;

    /// @notice `owner` can step down and assign some other address to this role
    /// @param _newOwner The address of the new owner. 0x0 can be used to create
    ///  an unowned neutral vault, however that cannot be undone
    function changeOwner(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }


    function acceptOwnership() public {
        if (msg.sender == newOwner) {
            owner = newOwner;
        }
    }
}

contract WRC20Protocol {
    /* This is a slight change to the ERC20 base standard.
    function totalSupply() constant returns (uint supply);
    is replaced with:
    uint public totalSupply;
    This automatically creates a getter function for the totalSupply.
    This is moved to the base contract since public getter functions are not
    currently recognised as an implementation of the matching abstract
    function by the compiler.
    */

    /**************************************
     **
     ** VARIABLES
     **
     **************************************/

    string public name;
    string public symbol;
    uint8 public decimals;
    mapping (address => uint) balances;
    mapping (address => mapping (address => uint)) allowed;

    /// total amount of tokens
    uint public totalSupply;

    /// @param _owner The address from which the balance will be retrieved
    /// @return The balance
    function balanceOf(address _owner) public view returns (uint balance);

    /// @notice send `_value` token to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint _value) public returns (bool success);

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint _value) public returns (bool success);

    /// @notice `msg.sender` approves `_spender` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of tokens to be approved for transfer
    /// @return Whether the approval was successful or not
    function approve(address _spender, uint _value) public returns (bool success);

    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) public view returns (uint remaining);

    event Transfer(address indexed _from, address indexed _to, uint _value);
    event Approval(address indexed _owner, address indexed _spender, uint _value);
}

contract StandardToken is WRC20Protocol {
    using SafeMath for uint;

    /**
    * @dev Fix for the ERC20 short address attack.
    */
    modifier onlyPayloadSize(uint size) {
        require(msg.data.length >= size + 4, "Payload size is incorrect");
        _;
    }

    function transfer(address _to, uint _value) public onlyPayloadSize(2 * 32) returns (bool success) {
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public onlyPayloadSize(3 * 32) returns (bool success) {
        balances[_to] = balances[_to].add(_value);
        balances[_from] = balances[_from].sub(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint balance) {
        return balances[_owner];
    }


    function approve(address _spender, uint _value) public onlyPayloadSize(2 * 32) returns (bool success) {
        //  To change the approve amount you first have to reduce the addresses`
        //  allowance to zero by calling `approve(_spender, 0)` if it is not
        //  already 0 to mitigate the race condition described here:
        //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

        require((_value == 0) || (allowed[msg.sender][_spender] == 0), "Not permitted");

        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint remaining) {
      return allowed[_owner][_spender];
    }
}


contract WRC20Token is StandardToken, Owned {
    using SafeMath for uint;

    /****************************************************************************
     **
     ** MODIFIERS
     **
     ****************************************************************************/
    modifier onlyMeaningfulValue(uint value) {
        require(value > 0, "Value is null");
        _;
    }

    /****************************************************************************
     **
     ** EVENTS
     **
     ****************************************************************************/
    /// @notice Logger for token mint
    /// @dev Logger for token mint
    /// @param account Whom these token will be minted to
    /// @param value Amount of ETH/WETH to be minted
    /// @param totalSupply Total amount of WETH after token mint
    event TokenMintedLogger(
        address indexed account,
        uint indexed value,
        uint indexed totalSupply
    );

    /// @notice Logger for token burn
    /// @dev Logger for token burn
    /// @param account Initiator address
    /// @param value Amount of WETH to be burnt
    /// @param totalSupply Total amount of WETH after token burn
    event TokenBurntLogger(
        address indexed account,
        uint indexed value,
        uint indexed totalSupply
    );

    ///@notice Initialize the TokenManager address
    ///@dev Initialize the TokenManager address
    ///@param tokenName The token name to be used
    ///@param tokenSymbol The token symbol to be used
    ///@param tokenDecimal The token decimals to be used
    constructor(string tokenName, string tokenSymbol, uint8 tokenDecimal)
        public
    {
        name = tokenName;
        symbol = tokenSymbol;
        decimals = tokenDecimal;
    }

    /****************************************************************************
     **
     ** MANIPULATIONS
     **
     ****************************************************************************/

    /// @notice Create token
    /// @dev Create token
    /// @param account Address will receive token
    /// @param value Amount of token to be minted
    function mint(address account, uint value)
        external
        onlyOwner
        onlyMeaningfulValue(value)
    {
        require(account != address(0), "Account is null");

        balances[account] = balances[account].add(value);
        totalSupply = totalSupply.add(value);

        emit TokenMintedLogger(account, value, totalSupply);
    }

    /// @notice Burn token
    /// @dev Burn token
    /// @param account Address of whose token will be burnt
    /// @param value Amount of token to be burnt
    function burn(address account, uint value)
        external
        onlyOwner
        onlyMeaningfulValue(value)
    {
        balances[account] = balances[account].sub(value);
        totalSupply = totalSupply.sub(value);

        emit TokenBurntLogger(account, value, totalSupply);
    }

}

contract Halt is Owned {

    bool public halted = true;

    modifier notHalted() {
        require(!halted);
        _;
    }

    modifier isHalted() {
        require(halted);
        _;
    }

    /// @notice function Emergency situation that requires
    /// @notice contribution period to stop or not.
    function setHalt(bool halt)
        public
        onlyOwner
    {
        halted = halt;
    }
}

contract ReentrancyGuard {
    bool private _notEntered;

    constructor () internal {
        // Storing an initial non-zero value makes deployment a bit more
        // expensive, but in exchange the refund on every call to nonReentrant
        // will be lower in amount. Since refunds are capped to a percetange of
        // the total transaction's gas, it is best to keep them low in cases
        // like this one, to increase the likelihood of the full refund coming
        // into effect.
        _notEntered = true;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and make it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_notEntered, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _notEntered = false;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _notEntered = true;
    }
}


contract RedPacket is Halt, ReentrancyGuard {

    using SafeMath for uint;

    ///the valid period for rp bonus
    uint public constant    RP_VALID_PERIOD = 24*60*60;
    uint public constant    RP_PRECISE      = 10000;
    uint public constant    RP_RANDOM_DIGITS = 100;

    // the rp bonus assign mode
    uint public constant    RP_MODE_AVERAGE = 0;
    uint public constant    RP_MODE_RANDOM  = 1;

    // the rp type
    uint public constant    RP_TYPE_DEFAULT = 0;
    uint public constant    RP_TYPE_REFERENCE = 1;

    // the fixed index value for wan token
    address public constant RP_ASSETTYPE_WAN = address(0);
    uint256 public constant RP_BONUS_MINVALUE = 1;

    /// the unit gas fee for rp
    uint256 public RP_GASFEE = 50000000000000000;

    struct RPCreateRecord{
        address     rpSender;       //1 the rp sender   //
        uint256     rpStartTime;    //2 the initial timestamp for this rp
        address     rpTokenAddr;    //3 the token type of this rp   //
        uint256     rpType;         //4 the rp type, referenceType or default
        uint256     rpCounts;       //5 the total counts of this rp
        uint256     rpMode;         //6 the bonus assign mode of this rp, random or average //
        uint256     rpBonus;        //7 the total bonus of this rp
        uint256     rpMinBonus;     //8 the min bonus for this rp   //
        uint256     rpRefBonus;     //9 the reference bonus of reference-type rp
        uint256     rpAllowance;    //10 the rp allowance for the rp service
        uint256     rpGasFee;       //11 the rp gas fee
    }

    struct RPStatus{
        uint256     rpRestCounts;   //1 the rest counts for rp
        uint256     rpRestBonus;    //2 the rest rp bonus of this rp
        uint256     rpRestRefBonus; //3 the rest rp reference bonus
        uint256     rpRestAllowance;//4 the rest gas fee
        bool        rpFinished;     //5 if rp has done finishRP action
    }

    struct RPClaimInfo{
        uint256     rpBonus;        //1 the bonus for this rp code
        address     rpTokenAddr;    //2 the token type of this rp
        address     rpRefCode;      //3 the reference code (optional)
    }

    struct RPRefInfo{
        uint256     rpRefTimes;     //1 the rp reference times
        uint256     rpRefBonus;     //2 the reference bonus for this referrer
        address     rpTokenAddr;    //3 the token type of this rp
    }


    ///the active rpcode map (rpCode -> activeStartTime)
    mapping(bytes32 => uint256) public mapRPCodeActiveTime;

    ///the registed rp map (rpCode ->  (startTime-> RPCreateRecord))
    mapping(bytes32 => mapping(uint256 => RPCreateRecord)) public mapRPRecord;

    ///the registed rp map (rpCode-> (rpStartTime -> RPStatus))
    mapping(bytes32 => mapping(uint256 => RPStatus)) public mapRPStatusInfo;

    ///the rp meta data for this rp (mapping: rpCode -> (rpStartTime -> (rpClaimer->RPClaimInfo)))
    mapping(bytes32 => mapping(uint256 => mapping(address => RPClaimInfo))) public mapRPClaimRecord;

    ///the registered WRC20 token (tokenAddr => wrc20Token)
    mapping(address => WRC20Token) public mapWRCToken;

    ///the max bonus setting for tokens (tokenAddr => uint256)
    mapping(address => uint256) public mapMaxBonusConfig;

    ///the account binded to the rp service
    mapping(address => bool) public mapRpServiceAccount;

    /**
    *
    * EVENTS
    *
    */
    /// @notice                           event for rp-create
    /// @param _rpCode                    rp code
    /// @param _rpSender                  rp creator address
    /// @param _rpBonus                   the total bonus of this rp
    /// @param _rpRefBonus                the total reference bonus of this rp
    /// @param _rpType                    the rp type
    /// @param _rpTokenType               the asset token type of this rp bonus
    event RedPacketCreateLogger(bytes32 indexed _rpCode, address indexed _rpSender, uint256 _rpBonus, uint256 _rpRefBonus, uint256 _rpType, address _rpTokenType);

    /// @notice                           event for rp-claim
    /// @param _rpCode                    rp code
    /// @param _rpStartTime               this rp starttime
    /// @param _rpClaimerAddr             rp claimer's address
    /// @param _rpBonus                   rp bonus
    /// @param _rpRefCode                 rp referrer's address
    /// @param _rpRestCounts              the rest rp count
    event RedPacketClaimLogger(bytes32 indexed _rpCode, uint256 indexed _rpStartTime, address indexed _rpClaimerAddr, uint256 _rpBonus, address _rpRefCode, uint256 _rpRestCounts);

    /// @notice                           event for rp bonus revoke
    /// @param _rpCode                    rp code
    /// @param _rpStartTime               this rp starttime
    /// @param _rpClaimerAddr             rp claimer's address
    /// @param _rpRefCode                 rp referrer's address
    /// @param _refBonus                  rp reference-bonus value
    event RedPacketReferenceBonusLogger(bytes32 indexed _rpCode, uint256 indexed _rpStartTime, address indexed _rpClaimerAddr,  address _rpRefCode, uint256 _refBonus);

    /// @notice                           event for rp bonus revoke
    /// @param _rpCode                    rp code
    /// @param _rpStartTime               rp creator address
    /// @param _rpSender                  rp sender's address
    /// @param _rpBonus                   rp revoked-bonus
    /// @param _rpRefBonus                rp revoked-ref-bonus
    /// @param _rpGasFee                  rp revoked-gas-Fee
    event RedPacketRevokeLogger(bytes32 indexed _rpCode, uint256 _rpStartTime, address indexed _rpSender, uint256 _rpBonus, uint256 _rpRefBonus, uint256 _rpGasFee);

    /// @notice                           event for rp bonus revoke
    /// @param _tokenAddress              token address
    /// @param _tokenSymbol               token symbol
    /// @param _tokenDecimals             token decimals
    event RegWRCTokenLogger(address indexed _tokenAddress, string _tokenSymbol, uint256 _tokenDecimals);

    /// @notice                           event for rp bonus revoke
    /// @param _rpGasFee                  token decimals
    /// @param _configTs                  config timestamp
    event RpGasFeeLogger(uint256 _rpGasFee, uint256 _configTs);

    /// @notice                           event for rp bonus revoke
    /// @param _tokenAddress              the wrc20 token address
    /// @param _rpMaxBonus                the max bonus for this wrc20 rp
    event RpMaxBonusConfigLogger(address indexed _tokenAddress, uint256 _rpMaxBonus);
    

    /**
     * MANIPULATIONS
     */
    constructor()
    public
    {
    }

    /// @notice default transfer to contract
    function () public payable {
       // revert all transfer tx
       revert("normal transfer is not acceptable");
    }

    /// @notice                         to register WRC20 token type
    /// @param _wrcAddr                 the wrc20 token address
    /// @param _rpMaxBonus              the max bonus for this wrc20 rp
    function RegWRCToken(address _wrcAddr, uint256 _rpMaxBonus)
    public
    onlyOwner
    {
        require(address(0) != _wrcAddr, "Invalid token address!");
        require(_rpMaxBonus > 1, "Invalid token max rp bonus!");

        WRC20Token wrcToken = WRC20Token(_wrcAddr);
        require(wrcToken.decimals() > 0, "Invalid token decimals!");

        mapWRCToken[_wrcAddr] = wrcToken;
        emit RegWRCTokenLogger(_wrcAddr, string(wrcToken.symbol()), wrcToken.decimals());
        
        mapMaxBonusConfig[_wrcAddr] = _rpMaxBonus;
        emit RpMaxBonusConfigLogger(_wrcAddr, _rpMaxBonus);
    }
    
    /// @notice                         to register WRC20 token type
    /// @param _rpGasFee                the rp gas fee
    function SetRPGasFee(uint256 _rpGasFee)
    public
    isHalted
    onlyOwner
    {
        RP_GASFEE = _rpGasFee;

        emit RpGasFeeLogger(_rpGasFee, now);
    }
    
    /// @notice                         to register WRC20 token type
    /// @param _wrcAddr                 the wrc20 token address
    /// @param _rpMaxBonus              the max bonus for this wrc rp
    function SetWrcMaxRpBonus(address _wrcAddr, uint256 _rpMaxBonus)
    public
    isHalted
    onlyOwner
    {
        require(_rpMaxBonus > 1, "Invalid token max rp bonus!");
        if(address(0) != _wrcAddr){
            require(mapWRCToken[_wrcAddr].decimals() > 0, "Unregisted wrc20 token!");
        }

        mapMaxBonusConfig[_wrcAddr] = _rpMaxBonus;

        emit RpMaxBonusConfigLogger(_wrcAddr, _rpMaxBonus);
    }

    /// @notice                         to get max bonus threshold for this WRC20 token type
    /// @param _wrcAddr                 the wrc20 token address
    function GetWrcMaxRpBonus(address _wrcAddr)
    public
    returns(uint256 rpMaxBonus)
    {
        rpMaxBonus = mapMaxBonusConfig[_wrcAddr];

        return rpMaxBonus;
    }

    /// @notice                         to get max bonus threshold for this WRC20 token type
    /// @param _accounts                the rp service manager's address
    /// @param _enable                  the enable for manager's role
    function RegistRpServiceAccounts(address _accounts, bool _enable)
    public
    onlyOwner
    {
        require(address(0) != _accounts, "Repeated RP Code!");
        mapRpServiceAccount[_accounts] = _enable;
    }

    /// @notice                         to create rp
    /// @param _rpCode                  the rp code array by which are used to claim rp
    /// @param _rpType                  the rp type, reference rp or normal rp
    /// @param _rpMode                  the bonus assignment mode
    /// @param _rpCounts                the total rp counts for this rp request
    /// @param _rpBonus                 the total bonus for this rp request
    /// @param _rpRefBonus              the total reference bonus for this reference type rp, default is 0
    /// @param _rpMinBonus              the total bonus for this rp request
    /// @param _rpTokenAddr             the rp bonus token type for this rp
    function CreateRP(bytes32 _rpCode, uint256 _rpType, uint256 _rpMode, uint256 _rpCounts, uint256 _rpBonus, uint256 _rpRefBonus, uint256 _rpMinBonus, address _rpTokenAddr)
    public
    payable
    notHalted
    nonReentrant
    {
        require(0 == mapRPCodeActiveTime[_rpCode], "Invalid RP Code!");
        require(address(0) == mapRPRecord[_rpCode][now].rpSender, "Repeated RP Code!");

        require(_rpMinBonus >= RP_BONUS_MINVALUE, "Invalid rp bonus: rp min bonus must bigger than RP_BONUS_MINVALUE");
        require(_rpCounts > 0, "Invalid rp count: rp count must bigger than 0");
        require(_rpBonus >= _rpMinBonus.mul(_rpCounts), "The rp minBonus setting is not suitable for the rp Bonus value!");
        require(_rpRefBonus >= 0, "Invalid rp ref bonus: ref bonus is now less than 0");

        uint256 estimateRPGasFee = 0; // claim rp & finish rp gas fee multi by 2
        if(RP_TYPE_REFERENCE == _rpType){
            require(_rpRefBonus > 0, "Invalid rp bonus: in case of reference typ rp, ref bonus must more than 0");
            estimateRPGasFee = RP_GASFEE.mul(_rpCounts.mul(2).add(1));
        }else{
            estimateRPGasFee = RP_GASFEE.mul(_rpCounts.mul(1).add(1));
        }

        // to estimate the gas fee for the rp claim & finish rp operation
        uint256 bonusValue = _rpBonus.add(_rpRefBonus); // to check the transfer bonus successful
        uint256 rpAllowance = 0;

        if(RP_ASSETTYPE_WAN == _rpTokenAddr){
            require(msg.value >= bonusValue.add(estimateRPGasFee), "Invalid rp bonus: the locked bonus is not enough for this rp");

            rpAllowance = msg.value.sub(bonusValue);
        }else{
            require(mapWRCToken[_rpTokenAddr].decimals() > 0, "Invalid rp Token Address!");
            require(msg.value >= estimateRPGasFee, "Gas Fee is not enough!"); // to check the rp gas fee
            require(mapWRCToken[_rpTokenAddr].transferFrom(msg.sender, this, bonusValue), "Transfer rp bonus failed!");

            rpAllowance = msg.value;
        }

        // to record active timestamp for this the rpCode
        mapRPCodeActiveTime[_rpCode] = now;

        // to register this new rp config
        mapRPRecord[_rpCode][now].rpSender = msg.sender;
        mapRPRecord[_rpCode][now].rpType = _rpType;
        mapRPRecord[_rpCode][now].rpMode = _rpMode;
        mapRPRecord[_rpCode][now].rpStartTime = now;
        mapRPRecord[_rpCode][now].rpCounts = _rpCounts;
        mapRPRecord[_rpCode][now].rpTokenAddr = _rpTokenAddr; // can be WAN or WRC20 token type
        mapRPRecord[_rpCode][now].rpMinBonus = _rpMinBonus;
        mapRPRecord[_rpCode][now].rpBonus = _rpBonus;
        mapRPRecord[_rpCode][now].rpRefBonus = _rpRefBonus; // in case of Default rp type, rpRefBonus is 0
        mapRPRecord[_rpCode][now].rpAllowance = rpAllowance;
        mapRPRecord[_rpCode][now].rpGasFee = RP_GASFEE;//rpGasFee

        // to initial the rp status
        mapRPStatusInfo[_rpCode][now].rpRestCounts = _rpCounts;
        mapRPStatusInfo[_rpCode][now].rpRestBonus = _rpBonus;//
        mapRPStatusInfo[_rpCode][now].rpRestRefBonus = _rpRefBonus;
        mapRPStatusInfo[_rpCode][now].rpRestAllowance = rpAllowance;
        mapRPStatusInfo[_rpCode][now].rpFinished = false;

        // emit RP create info
        emit RedPacketCreateLogger(_rpCode, msg.sender, _rpBonus, _rpRefBonus, _rpType, _rpTokenAddr);
    }

    /// @notice                         to transfer rp bonus
    /// @param _receiver                the account to which rp bonus should transfer
    /// @param _rpBonus                 the rp bonus
    /// @param _rpTokenAddr             the token address
    function transferRPBonus(address _receiver, uint256 _rpBonus, address _rpTokenAddr)
    private
    {
        if(RP_ASSETTYPE_WAN == _rpTokenAddr){
            _receiver.transfer(_rpBonus);

        }else{
            mapWRCToken[_rpTokenAddr].transfer(_receiver, _rpBonus);
        }
    }

    /// @notice                         to claim rp
    /// @param _rpCode                  the claim code for rp
    /// @param _rpClaimer               the claimer
    /// @param _referenceCode           the reference code which is referrer's addrss, default is null
    function ClaimRP(bytes32 _rpCode, address _rpClaimer, address _referenceCode)
    public
    notHalted
    {
        require(true == mapRpServiceAccount[msg.sender], "Permission is not allowed!");
        require(address(0) != _rpClaimer, "Invalid rp claimer address!");

        uint256 rpActiveTs = mapRPCodeActiveTime[_rpCode];
        require(0 != rpActiveTs, "Invalid RP Code!");

        // to check the time validity of the rp
        require(mapRPStatusInfo[_rpCode][rpActiveTs].rpRestBonus > 0, "RP Takes 0 Bonus!");
        require(mapRPStatusInfo[_rpCode][rpActiveTs].rpRestCounts > 0, "No More RP Exist!");
        require((now - mapRPRecord[_rpCode][rpActiveTs].rpStartTime) < RP_VALID_PERIOD, "Timeout RP!");
   
        // to caculate the rp bonus for this rsp claimer
        uint256 tmpRPBonus = generateRPBonus(_rpCode, rpActiveTs, _rpClaimer);
        require(tmpRPBonus >= mapRPRecord[_rpCode][rpActiveTs].rpMinBonus, "Invalid rp bonus!");

        // to build this rp claimer's RPClaimInfo
        require(0 == mapRPClaimRecord[_rpCode][rpActiveTs][_rpClaimer].rpBonus, "repeated rp claimer for this rp!");
        mapRPClaimRecord[_rpCode][rpActiveTs][_rpClaimer].rpBonus = tmpRPBonus;
        mapRPClaimRecord[_rpCode][rpActiveTs][_rpClaimer].rpRefCode = _referenceCode;
        mapRPClaimRecord[_rpCode][rpActiveTs][_rpClaimer].rpTokenAddr = mapRPRecord[_rpCode][rpActiveTs].rpTokenAddr;

        uint256 tmpGasFee = mapRPRecord[_rpCode][rpActiveTs].rpGasFee;
        uint256 refBonus = 0;

        if((RP_TYPE_REFERENCE == mapRPRecord[_rpCode][rpActiveTs].rpType) && (address(0) != _referenceCode)){
            // caculate the refBonus value for this claim
            refBonus = mapRPRecord[_rpCode][rpActiveTs].rpRefBonus.mul(RP_PRECISE)
                                                                        .div(mapRPRecord[_rpCode][rpActiveTs].rpCounts)
                                                                        .div(RP_PRECISE);
            // update the ref bonus value
            mapRPStatusInfo[_rpCode][rpActiveTs].rpRestRefBonus = mapRPStatusInfo[_rpCode][rpActiveTs].rpRestRefBonus.sub(refBonus);
            tmpGasFee = tmpGasFee.add(mapRPRecord[_rpCode][rpActiveTs].rpGasFee);
        }

        // to update this rp status info
        mapRPStatusInfo[_rpCode][rpActiveTs].rpRestBonus = mapRPStatusInfo[_rpCode][rpActiveTs].rpRestBonus.sub(tmpRPBonus);
        mapRPStatusInfo[_rpCode][rpActiveTs].rpRestCounts = mapRPStatusInfo[_rpCode][rpActiveTs].rpRestCounts.sub(1);
        mapRPStatusInfo[_rpCode][rpActiveTs].rpRestAllowance = mapRPStatusInfo[_rpCode][rpActiveTs].rpRestAllowance.sub(tmpGasFee);

        // to transfer rp gas fee to rp service
        if(tmpGasFee > 0){
            transferRPBonus(msg.sender, tmpGasFee, RP_ASSETTYPE_WAN);
        }

        // to transfer the rp bonus to rp claimer
        if(tmpRPBonus > 0){
            transferRPBonus(_rpClaimer, tmpRPBonus, mapRPRecord[_rpCode][rpActiveTs].rpTokenAddr);
        }

        if(refBonus > 0){
            // to transfer the reference bonus to referrer
            transferRPBonus(_referenceCode, refBonus, mapRPRecord[_rpCode][rpActiveTs].rpTokenAddr);
            emit RedPacketReferenceBonusLogger(_rpCode, rpActiveTs, _rpClaimer, _referenceCode, refBonus);
        }

        emit RedPacketClaimLogger(_rpCode, rpActiveTs, _rpClaimer, tmpRPBonus, _referenceCode, mapRPStatusInfo[_rpCode][rpActiveTs].rpRestCounts);
    }

    /// @notice                         to generate the rp bonus by average or random
    /// @param _rpCode                  the rp code
    /// @param _rpActiveTs              the rp active timestamp
    /// @param _rpClaimer               the claimer
    function generateRPBonus(bytes32 _rpCode, uint256 _rpActiveTs, address _rpClaimer)
    private
    returns(uint256 bonus)
    {
        bonus = 0;

        if(mapRPStatusInfo[_rpCode][_rpActiveTs].rpRestCounts == 1){
            bonus = mapRPStatusInfo[_rpCode][_rpActiveTs].rpRestBonus;
            return bonus;
        }

        if(RP_MODE_AVERAGE == mapRPRecord[_rpCode][_rpActiveTs].rpMode){
            bonus = mapRPStatusInfo[_rpCode][_rpActiveTs].rpRestBonus.mul(RP_PRECISE)
                                                        .div(mapRPStatusInfo[_rpCode][_rpActiveTs].rpRestCounts)
                                                        .div(RP_PRECISE);
        }else{
            uint256 tmpRandom = uint256(keccak256(now, _rpClaimer, block.number)) % RP_RANDOM_DIGITS;

            uint256 reservedBonus = mapRPRecord[_rpCode][_rpActiveTs].rpMinBonus.mul(mapRPStatusInfo[_rpCode][_rpActiveTs].rpRestCounts);
            uint256 tmpRestBonus = mapRPStatusInfo[_rpCode][_rpActiveTs].rpRestBonus.sub(reservedBonus);
            uint256 maxTmpBonus = tmpRestBonus.mul(RP_PRECISE).div(mapRPStatusInfo[_rpCode][_rpActiveTs].rpRestCounts).mul(2).div(RP_PRECISE);

            bonus = (maxTmpBonus.mul(tmpRandom).div(RP_RANDOM_DIGITS)).add(mapRPRecord[_rpCode][_rpActiveTs].rpMinBonus);
        }

        return bonus;
    }
        
    /// @notice                    to finish rp record
    /// @param _rpCode             the rp code
    function FinishRP(bytes32 _rpCode)
    public
    notHalted
    {
        bool isValidRpSrvAccount = mapRpServiceAccount[msg.sender];
        require(true == isValidRpSrvAccount, "Permission is not allowed!");

        uint256 rpActiveTs = mapRPCodeActiveTime[_rpCode];
        require(0 != rpActiveTs, "Invalid RP Code!");

        // Step 1: to verify the unused rp
        require(address(0) != mapRPRecord[_rpCode][rpActiveTs].rpSender, "Invalid RP Creater!");
        require((now - mapRPRecord[_rpCode][rpActiveTs].rpStartTime) >= RP_VALID_PERIOD, "RP Is Not Timeout!");
        require(false == mapRPStatusInfo[_rpCode][rpActiveTs].rpFinished, "RP has been finished!");
   
        // Step 2: to revoke unused rp bonus to its sender
        settleRP(_rpCode);
    }

    /// @notice                    to revoke the rest asset to rp sender
    /// @param _rpCode             the rp code
    function settleRP(bytes32 _rpCode)
    private
    {
        uint256 rpActiveTs = mapRPCodeActiveTime[_rpCode];
        require(0 != rpActiveTs, "Invalid RP Code!");

        uint256 restValue = 0;

        // step 1: to count the rest asset of this rp
        // part 1: may be take rest rp bonus
        uint256 restBonusValue = mapRPStatusInfo[_rpCode][rpActiveTs].rpRestBonus;
        if(restBonusValue > 0){
            restValue = restValue.add(restBonusValue);
            mapRPStatusInfo[_rpCode][rpActiveTs].rpRestBonus = 0;
        }

        // part 2: may be take rest ref bonus in case of no anyone has been referencable
        uint256 restRefBonusValue = mapRPStatusInfo[_rpCode][rpActiveTs].rpRestRefBonus;
        if((RP_TYPE_REFERENCE == mapRPRecord[_rpCode][rpActiveTs].rpType) && (restRefBonusValue > 0)){
            restValue = restValue.add(restRefBonusValue);
            mapRPStatusInfo[_rpCode][rpActiveTs].rpRestRefBonus = 0;
        }

        // part 3: may be take rest gas fee
        uint256 restGasFee = mapRPStatusInfo[_rpCode][rpActiveTs].rpRestAllowance.sub(mapRPRecord[_rpCode][rpActiveTs].rpGasFee);

        // to de-active timestamp for this the rpCode
        mapRPCodeActiveTime[_rpCode] = 0;

        mapRPStatusInfo[_rpCode][rpActiveTs].rpRestAllowance = 0;
        mapRPStatusInfo[_rpCode][rpActiveTs].rpFinished = true;

        // step 2: to revoke the rest asset of this rp
        if(restGasFee > 0){
            // part 1: take rest gas fee
            if(RP_ASSETTYPE_WAN == mapRPRecord[_rpCode][rpActiveTs].rpTokenAddr){
                // in case of wan token
                restValue = restValue.add(restGasFee);
            }else{
                // in case of wrc20 token type, the rp gas fee is wan asset
                transferRPBonus(mapRPRecord[_rpCode][rpActiveTs].rpSender, restGasFee, RP_ASSETTYPE_WAN);
            }
        }

        // part 2: if takes rest bonus, then revoke to rp sender
        if(restValue > 0){
            transferRPBonus(mapRPRecord[_rpCode][rpActiveTs].rpSender, restValue, mapRPRecord[_rpCode][rpActiveTs].rpTokenAddr);
        }

        // part 3:  to transfer rp gas fee to rp service
        if(mapRPRecord[_rpCode][rpActiveTs].rpGasFee > 0){
            transferRPBonus(msg.sender, mapRPRecord[_rpCode][rpActiveTs].rpGasFee, RP_ASSETTYPE_WAN);
        }

        emit RedPacketRevokeLogger(_rpCode, rpActiveTs, mapRPRecord[_rpCode][rpActiveTs].rpSender, restBonusValue, restRefBonusValue, restGasFee);
    }

}