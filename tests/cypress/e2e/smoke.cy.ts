describe('homepage', () => {
  it('loads', () => {
    cy.visit('/');
    cy.contains('Describe your idea');
  });
});
