import {
    squash,
    fetchJson,
    hasModifierKey,
    debounce,
    throttle,
    getAppVersion
} from 'community_runtime/utils';

beforeEach(() => {
    jest.clearAllMocks();
    expect.hasAssertions();
});

jest.useFakeTimers('legacy');

describe('community_runtime/utils', () => {
    describe('squash', () => {
        const event = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        };

        it('preventDefault and stopPropagation are called', () => {
            squash(event);
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        });
    });

    describe('hasModifierKey', () => {
        it('ctrlKey used return true', () => {
            const mockKey = jest.mock();
            const event = { ctrlKey: mockKey };
            expect(hasModifierKey(event)).toBe(mockKey);
        });
        it('shiftKey used return true', () => {
            const mockKey = jest.mock();
            const event = { shiftKey: mockKey };
            expect(hasModifierKey(event)).toBe(mockKey);
        });
        it('altKey used return true', () => {
            const mockKey = jest.mock();
            const event = { altKey: mockKey };
            expect(hasModifierKey(event)).toBe(mockKey);
        });
        it('metaKey used return true', () => {
            const mockKey = jest.mock();
            const event = { metaKey: mockKey };
            expect(hasModifierKey(event)).toBe(mockKey);
        });
        it('no key used return true', () => {
            const event = {};
            expect(hasModifierKey(event)).toBeUndefined();
        });
    });

    describe('debounce', () => {
        it('debounce calls fn after timer', () => {
            const fn = jest.fn();
            const wait = 1000;
            const debounceFunction = debounce(fn, wait);
            debounceFunction();
            expect(fn).not.toHaveBeenCalled();
            expect(setTimeout).toHaveBeenCalledTimes(1);
            jest.runAllTimers();
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('calling debounce twice within wait time does not call function twice', () => {
            const fn = jest.fn();
            const wait = 10000;
            const debounceFunction = debounce(fn, wait);
            debounceFunction();
            expect(fn).not.toHaveBeenCalled();
            debounceFunction();
            expect(fn).not.toHaveBeenCalled();
            jest.runAllTimers();
            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledTimes(1);
        });
    });

    describe('throttle', () => {
        it('calls fn immediately', () => {
            const fn = jest.fn();
            throttle(fn, 1000)();
            expect(fn).toHaveBeenCalledTimes(1);
        });
        it('calls function only once during wait time', () => {
            const fn = jest.fn();
            const wait = 1000;
            const throttled = throttle(fn, wait);
            throttled();
            jest.advanceTimersByTime(wait / 2);
            throttled();
            expect(fn).toHaveBeenCalledTimes(1);
        });
        it('calls function again after wait time expires', () => {
            const fn = jest.fn();
            const wait = 1000;
            const throttled = throttle(fn, wait);
            throttled();
            jest.advanceTimersByTime(wait);
            throttled();
            expect(fn).toHaveBeenCalledTimes(2);
        });
    });

    describe('fetchJson', () => {
        it('get', () => {
            const responseMock = 'responseMock';
            window.fetch = jest.fn(() => {
                return Promise.resolve({
                    ok: true,
                    json: jest.fn(() => responseMock)
                });
            });

            expect(window.fetch).not.toHaveBeenCalled();
            return fetchJson('www.salesforce.com').then((resp) => {
                expect(resp).toBe(responseMock);
                expect(window.fetch).toHaveBeenCalledTimes(1);
            });
        });
        it('get with bad request', () => {
            window.fetch = jest.fn(() => {
                return Promise.resolve({
                    ok: false
                });
            });

            expect(window.fetch).not.toHaveBeenCalled();
            return fetchJson('www.salesforce.com').then((resp) => {
                expect(resp).toBeNull();
                expect(window.fetch).toHaveBeenCalledTimes(1);
            });
        });
        it('post', () => {
            window.fetch = jest.fn();

            const fakeJson = {
                body: '{"true":"true"}',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json; charset=UTF-8',
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                method: 'POST'
            };
            expect(window.fetch).not.toHaveBeenCalled();
            fetchJson('www.salesforce.com', { true: 'true' });
            expect(window.fetch).toHaveBeenCalledTimes(1);
            expect(window.fetch).toHaveBeenCalledWith(
                'www.salesforce.com',
                fakeJson
            );
        });
    });

    describe('getAppVersion', () => {
        it('returns version in storageService when $A exists', () => {
            const mockVersion = 'mockVersion';
            window.$A = {
                storageService: {
                    version: mockVersion
                }
            };
            const version = getAppVersion();
            expect(version).toBe(mockVersion);
        });
        it('returns default version when $A is null', () => {
            window.$A = null;
            const defaultVersion = '44.0';
            const version = getAppVersion();
            expect(version).toBe(defaultVersion);
        });
    });
});