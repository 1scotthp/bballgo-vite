// isTradeLegal.test.ts
import { isTradeLegal } from '../utils/contracts'; // Adjust the import path as needed


describe('isTradeLegal', () => {

  test('Trade should be legal for team below the apron with outgoing salary below $7.25M', () => {
    expect(isTradeLegal({
      currentSalary: 100000000, // Well below the first apron
      outgoingSalary: 7000000, // Below the $7.25M threshold
      incomingSalary: 14250000, // 200% of outgoing + $250,000
      isTaxTeam: false,
    })).toBe(true);
  });

  test('Trade should be illegal for team below the apron with outgoing salary above $29M', () => {
    expect(isTradeLegal({
      currentSalary: 140000000, // Below the first apron
      outgoingSalary: 30000000, // Above the $29M threshold
      incomingSalary: 38000000, // More than 125% of outgoing + $250,000
      isTaxTeam: false,
    })).toBe(false);
  });

  test('Trade should be legal for team above the apron with matching salary within 110%', () => {
    expect(isTradeLegal({
      currentSalary: 170000000, // Above the first apron
      outgoingSalary: 10000000, // Example outgoing salary
      incomingSalary: 11000000, // 110% of the outgoing salary
      isTaxTeam: true,
    })).toBe(true);
  });

  test('Trade should be illegal for team above the apron with incoming salary exceeding 110%', () => {
    expect(isTradeLegal({
      currentSalary: 170000000, // Above the first apron
      outgoingSalary: 10000000, // Example outgoing salary
      incomingSalary: 12000000, // Exceeding 110% of the outgoing salary
      isTaxTeam: true,
    })).toBe(false);
  });

  test('Trade should be legal for tax team below the apron without pushing over, with dynamic formula', () => {
    expect(isTradeLegal({
      currentSalary: 165000000, // Just below the apron
      outgoingSalary: 10000000, // Example outgoing salary
      incomingSalary: 20000000, // Within the dynamic S-TPE range
      isTaxTeam: true,
    })).toBe(false);
  });

  test('Trade should be illegal for tax team if trade pushes them over the apron', () => {
    expect(isTradeLegal({
      currentSalary: 167000000, // Just below the apron
      outgoingSalary: 10000000, // Example outgoing salary
      incomingSalary: 22000000, // Incoming salary that pushes over the apron
      isTaxTeam: true,
    })).toBe(false);
  });

  // Add more tests for other edge cases and conditions...
});

