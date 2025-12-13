// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract EventTicketing {
    address public admin;
    uint256 public eventCounter;
    uint256 public ticketCounter;

    struct Event {
        uint256 id;
        string name;
        string description;
        string location;
        uint256 date;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 ticketsSold;
        bool isActive;
        address creator;
    }

    struct Ticket {
        uint256 id;
        uint256 eventId;
        address owner;
        bool isUsed;
        uint256 purchaseTime;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public userTickets;
    mapping(uint256 => uint256[]) public eventTickets;

    event EventCreated(uint256 indexed eventId, string name, address creator);
    event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, address buyer);
    event TicketUsed(uint256 indexed ticketId, uint256 indexed eventId);
    event EventStatusChanged(uint256 indexed eventId, bool isActive);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier eventExists(uint256 _eventId) {
        require(_eventId > 0 && _eventId <= eventCounter, "Event does not exist");
        _;
    }

    modifier ticketExists(uint256 _ticketId) {
        require(_ticketId > 0 && _ticketId <= ticketCounter, "Ticket does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
        eventCounter = 0;
        ticketCounter = 0;
    }

    function createEvent(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _date,
        uint256 _ticketPrice,
        uint256 _totalTickets
    ) public onlyAdmin returns (uint256) {
        require(bytes(_name).length > 0, "Event name cannot be empty");
        require(_totalTickets > 0, "Total tickets must be greater than 0");
        require(_date > block.timestamp, "Event date must be in the future");

        eventCounter++;
        events[eventCounter] = Event({
            id: eventCounter,
            name: _name,
            description: _description,
            location: _location,
            date: _date,
            ticketPrice: _ticketPrice,
            totalTickets: _totalTickets,
            ticketsSold: 0,
            isActive: true,
            creator: msg.sender
        });

        emit EventCreated(eventCounter, _name, msg.sender);
        return eventCounter;
    }

    function purchaseTicket(uint256 _eventId) public payable eventExists(_eventId) returns (uint256) {
        Event storage eventData = events[_eventId];
        
        require(eventData.isActive, "Event is not active");
        require(eventData.ticketsSold < eventData.totalTickets, "All tickets sold");
        require(msg.value >= eventData.ticketPrice, "Insufficient payment");
        require(eventData.date > block.timestamp, "Event has already passed");

        ticketCounter++;
        tickets[ticketCounter] = Ticket({
            id: ticketCounter,
            eventId: _eventId,
            owner: msg.sender,
            isUsed: false,
            purchaseTime: block.timestamp
        });

        eventData.ticketsSold++;
        userTickets[msg.sender].push(ticketCounter);
        eventTickets[_eventId].push(ticketCounter);

        // Refund excess payment
        if (msg.value > eventData.ticketPrice) {
            payable(msg.sender).transfer(msg.value - eventData.ticketPrice);
        }

        emit TicketPurchased(ticketCounter, _eventId, msg.sender);
        return ticketCounter;
    }

    function useTicket(uint256 _ticketId) public onlyAdmin ticketExists(_ticketId) {
        Ticket storage ticket = tickets[_ticketId];
        require(!ticket.isUsed, "Ticket already used");
        
        ticket.isUsed = true;
        emit TicketUsed(_ticketId, ticket.eventId);
    }

    function toggleEventStatus(uint256 _eventId) public onlyAdmin eventExists(_eventId) {
        Event storage eventData = events[_eventId];
        eventData.isActive = !eventData.isActive;
        emit EventStatusChanged(_eventId, eventData.isActive);
    }

    function getEvent(uint256 _eventId) public view eventExists(_eventId) returns (
        uint256 id,
        string memory name,
        string memory description,
        string memory location,
        uint256 date,
        uint256 ticketPrice,
        uint256 totalTickets,
        uint256 ticketsSold,
        bool isActive
    ) {
        Event memory eventData = events[_eventId];
        return (
            eventData.id,
            eventData.name,
            eventData.description,
            eventData.location,
            eventData.date,
            eventData.ticketPrice,
            eventData.totalTickets,
            eventData.ticketsSold,
            eventData.isActive
        );
    }

    function getTicket(uint256 _ticketId) public view ticketExists(_ticketId) returns (
        uint256 id,
        uint256 eventId,
        address owner,
        bool isUsed,
        uint256 purchaseTime
    ) {
        Ticket memory ticket = tickets[_ticketId];
        return (
            ticket.id,
            ticket.eventId,
            ticket.owner,
            ticket.isUsed,
            ticket.purchaseTime
        );
    }

    function getUserTickets(address _user) public view returns (uint256[] memory) {
        return userTickets[_user];
    }

    function getEventTickets(uint256 _eventId) public view returns (uint256[] memory) {
        return eventTickets[_eventId];
    }

    function getAllEvents() public view returns (uint256[] memory) {
        uint256[] memory eventIds = new uint256[](eventCounter);
        for (uint256 i = 1; i <= eventCounter; i++) {
            eventIds[i - 1] = i;
        }
        return eventIds;
    }

    function withdrawFunds() public onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
