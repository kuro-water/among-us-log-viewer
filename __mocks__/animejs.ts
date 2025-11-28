/**
 * Jest mock for anime.js v4
 * This mock provides a no-op implementation of the animate function
 * for testing purposes.
 */
export const animate = jest.fn().mockReturnValue({
  play: jest.fn(),
  pause: jest.fn(),
  restart: jest.fn(),
  reverse: jest.fn(),
  seek: jest.fn(),
  completed: Promise.resolve(),
});

export const createAnimatable = jest.fn().mockReturnValue({});
export const createTimeline = jest.fn().mockReturnValue({
  add: jest.fn().mockReturnThis(),
  play: jest.fn(),
  pause: jest.fn(),
});

export default {
  animate,
  createAnimatable,
  createTimeline,
};
