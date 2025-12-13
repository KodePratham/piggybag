import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xf9011fFE4Ef275A491842327802F1Da56a368caa";
  
  console.log("Checking events for contract:", contractAddress);
  
  const EventTicketing = await ethers.getContractFactory("EventTicketing");
  const contract = EventTicketing.attach(contractAddress);
  
  // Get all event IDs
  const eventIds = await contract.getAllEvents();
  console.log("Event IDs:", eventIds);
  
  // Get event counter
  const eventCounter = await contract.eventCounter();
  console.log("Event Counter:", eventCounter.toString());
  
  // Get each event details
  for (let i = 0; i < eventIds.length; i++) {
    const eventId = eventIds[i];
    console.log(`\n--- Event ${eventId} ---`);
    
    const event = await contract["getEvent(uint256)"](eventId);
    console.log("Name:", event.name);
    console.log("Description:", event.description);
    console.log("Location:", event.location);
    console.log("Date:", new Date(Number(event.date) * 1000).toLocaleString());
    console.log("Ticket Price:", ethers.formatEther(event.ticketPrice), "MON");
    console.log("Total Tickets:", event.totalTickets.toString());
    console.log("Tickets Sold:", event.ticketsSold.toString());
    console.log("Is Active:", event.isActive);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
