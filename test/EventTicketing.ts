import { expect } from "chai";
import hre from "hardhat";
import { EventTicketing } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = hre;

describe("EventTicketing", function () {
  let eventTicketing: EventTicketing;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [admin, user1, user2] = await ethers.getSigners();

    const EventTicketing = await ethers.getContractFactory("EventTicketing");
    eventTicketing = await EventTicketing.deploy();
    await eventTicketing.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await eventTicketing.admin()).to.equal(admin.address);
    });

    it("Should initialize counters to 0", async function () {
      expect(await eventTicketing.eventCounter()).to.equal(0);
      expect(await eventTicketing.ticketCounter()).to.equal(0);
    });
  });

  describe("Event Creation", function () {
    it("Should create an event successfully", async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      const ticketPrice = ethers.parseEther("0.1");

      await expect(
        eventTicketing.createEvent(
          "Test Event",
          "Test Description",
          "Test Location",
          futureDate,
          ticketPrice,
          100
        )
      )
        .to.emit(eventTicketing, "EventCreated")
        .withArgs(1, "Test Event", admin.address);

      const event = await eventTicketing["getEvent(uint256)"](1);
      expect(event.name).to.equal("Test Event");
      expect(event.ticketPrice).to.equal(ticketPrice);
      expect(event.totalTickets).to.equal(100);
      expect(event.isActive).to.equal(true);
    });

    it("Should fail if not admin", async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const ticketPrice = ethers.parseEther("0.1");

      await expect(
        eventTicketing
          .connect(user1)
          .createEvent("Test Event", "Description", "Location", futureDate, ticketPrice, 100)
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("Should fail with empty name", async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const ticketPrice = ethers.parseEther("0.1");

      await expect(
        eventTicketing.createEvent("", "Description", "Location", futureDate, ticketPrice, 100)
      ).to.be.revertedWith("Event name cannot be empty");
    });

    it("Should fail with past date", async function () {
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
      const ticketPrice = ethers.parseEther("0.1");

      await expect(
        eventTicketing.createEvent(
          "Test Event",
          "Description",
          "Location",
          pastDate,
          ticketPrice,
          100
        )
      ).to.be.revertedWith("Event date must be in the future");
    });
  });

  describe("Ticket Purchase", function () {
    let eventId: number;
    let ticketPrice: bigint;

    beforeEach(async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      ticketPrice = ethers.parseEther("0.1");

      await eventTicketing.createEvent(
        "Test Event",
        "Description",
        "Location",
        futureDate,
        ticketPrice,
        100
      );
      eventId = 1;
    });

    it("Should purchase a ticket successfully", async function () {
      await expect(
        eventTicketing.connect(user1).purchaseTicket(eventId, { value: ticketPrice })
      )
        .to.emit(eventTicketing, "TicketPurchased")
        .withArgs(1, eventId, user1.address);

      const ticket = await eventTicketing.getTicket(1);
      expect(ticket.owner).to.equal(user1.address);
      expect(ticket.eventId).to.equal(eventId);
      expect(ticket.isUsed).to.equal(false);

      const event = await eventTicketing["getEvent(uint256)"](eventId);
      expect(event.ticketsSold).to.equal(1);
    });

    it("Should refund excess payment", async function () {
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const excessPayment = ethers.parseEther("0.2");

      const tx = await eventTicketing
        .connect(user1)
        .purchaseTicket(eventId, { value: excessPayment });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      const expectedBalance = balanceBefore - ticketPrice - gasUsed;

      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.0001"));
    });

    it("Should fail with insufficient payment", async function () {
      const insufficientPayment = ethers.parseEther("0.05");

      await expect(
        eventTicketing.connect(user1).purchaseTicket(eventId, { value: insufficientPayment })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail for inactive event", async function () {
      await eventTicketing.toggleEventStatus(eventId);

      await expect(
        eventTicketing.connect(user1).purchaseTicket(eventId, { value: ticketPrice })
      ).to.be.revertedWith("Event is not active");
    });

    it("Should fail when sold out", async function () {
      // Create event with only 2 tickets
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      await eventTicketing.createEvent(
        "Limited Event",
        "Description",
        "Location",
        futureDate,
        ticketPrice,
        2
      );

      // Buy 2 tickets
      await eventTicketing.connect(user1).purchaseTicket(2, { value: ticketPrice });
      await eventTicketing.connect(user2).purchaseTicket(2, { value: ticketPrice });

      // Try to buy 3rd ticket
      await expect(
        eventTicketing.connect(user1).purchaseTicket(2, { value: ticketPrice })
      ).to.be.revertedWith("All tickets sold");
    });
  });

  describe("Event Management", function () {
    let eventId: number;

    beforeEach(async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const ticketPrice = ethers.parseEther("0.1");

      await eventTicketing.createEvent(
        "Test Event",
        "Description",
        "Location",
        futureDate,
        ticketPrice,
        100
      );
      eventId = 1;
    });

    it("Should toggle event status", async function () {
      await expect(eventTicketing.toggleEventStatus(eventId))
        .to.emit(eventTicketing, "EventStatusChanged")
        .withArgs(eventId, false);

      let event = await eventTicketing["getEvent(uint256)"](eventId);
      expect(event.isActive).to.equal(false);

      await eventTicketing.toggleEventStatus(eventId);
      event = await eventTicketing["getEvent(uint256)"](eventId);
      expect(event.isActive).to.equal(true);
    });

    it("Should fail toggle if not admin", async function () {
      await expect(
        eventTicketing.connect(user1).toggleEventStatus(eventId)
      ).to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Ticket Management", function () {
    let ticketId: number;

    beforeEach(async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const ticketPrice = ethers.parseEther("0.1");

      await eventTicketing.createEvent(
        "Test Event",
        "Description",
        "Location",
        futureDate,
        ticketPrice,
        100
      );

      await eventTicketing.connect(user1).purchaseTicket(1, { value: ticketPrice });
      ticketId = 1;
    });

    it("Should mark ticket as used", async function () {
      await expect(eventTicketing.useTicket(ticketId))
        .to.emit(eventTicketing, "TicketUsed")
        .withArgs(ticketId, 1);

      const ticket = await eventTicketing.getTicket(ticketId);
      expect(ticket.isUsed).to.equal(true);
    });

    it("Should fail if ticket already used", async function () {
      await eventTicketing.useTicket(ticketId);

      await expect(eventTicketing.useTicket(ticketId)).to.be.revertedWith("Ticket already used");
    });

    it("Should fail if not admin", async function () {
      await expect(eventTicketing.connect(user1).useTicket(ticketId)).to.be.revertedWith(
        "Only admin can call this function"
      );
    });
  });

  describe("Fund Management", function () {
    beforeEach(async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const ticketPrice = ethers.parseEther("0.1");

      await eventTicketing.createEvent(
        "Test Event",
        "Description",
        "Location",
        futureDate,
        ticketPrice,
        100
      );

      // Buy some tickets
      await eventTicketing.connect(user1).purchaseTicket(1, { value: ticketPrice });
      await eventTicketing.connect(user2).purchaseTicket(1, { value: ticketPrice });
    });

    it("Should withdraw funds", async function () {
      const balanceBefore = await ethers.provider.getBalance(admin.address);
      const contractBalance = await eventTicketing.getContractBalance();

      const tx = await eventTicketing.withdrawFunds();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(admin.address);
      const expectedBalance = balanceBefore + contractBalance - gasUsed;

      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.0001"));
      expect(await eventTicketing.getContractBalance()).to.equal(0);
    });

    it("Should fail withdraw if not admin", async function () {
      await expect(eventTicketing.connect(user1).withdrawFunds()).to.be.revertedWith(
        "Only admin can call this function"
      );
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const ticketPrice = ethers.parseEther("0.1");

      // Create 3 events
      for (let i = 0; i < 3; i++) {
        await eventTicketing.createEvent(
          `Event ${i + 1}`,
          "Description",
          "Location",
          futureDate,
          ticketPrice,
          100
        );
      }

      // User1 buys tickets for event 1 and 2
      await eventTicketing.connect(user1).purchaseTicket(1, { value: ticketPrice });
      await eventTicketing.connect(user1).purchaseTicket(2, { value: ticketPrice });
    });

    it("Should get all events", async function () {
      const eventIds = await eventTicketing.getAllEvents();
      expect(eventIds.length).to.equal(3);
      expect(eventIds[0]).to.equal(1);
      expect(eventIds[2]).to.equal(3);
    });

    it("Should get user tickets", async function () {
      const tickets = await eventTicketing.getUserTickets(user1.address);
      expect(tickets.length).to.equal(2);
    });

    it("Should get event tickets", async function () {
      const tickets = await eventTicketing.getEventTickets(1);
      expect(tickets.length).to.equal(1);
    });
  });
});
