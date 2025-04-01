/*
 * This is a workaround for a Node.js bug in AbortSignal.any(), borrowed from graphql-hive/gateway
 * with minor style modification. Big thanks to @enisdenjo for making this.
 *
 * Bug: https://github.com/nodejs/node/issues/57736
 * Source: https://github.com/graphql-hive/gateway/pull/922
 */

// https://github.com/unjs/std-env/blob/ab15595debec9e9115a9c1d31bc7597a8e71dbfd/src/runtimes.ts
// eslint-disable-next-line n/prefer-global/process
const isNode = !globalThis.Bun && globalThis.process?.release?.name === 'node';

const anySignalRegistry = isNode ?
    new FinalizationRegistry((callback) => {
        return callback();
    }) :
    null;

const controllerInSignalSy = Symbol('CONTROLLER_IN_SIGNAL');

/*
 * Memory safe ponyfill of `AbortSignal.any`. In Node environments, the native
 * `AbortSignal.any` seems to be leaky and can lead to subtle memory leaks over
 * a larger period of time.
 *
 * This ponyfill is a custom implementation that makes sure AbortSignals get properly
 * GC-ed as well as aborted.
 */
export const abortSignalAny = (signals) => {
    if (signals.length === 0) {
        // If no signals are passed, return undefined because the abortcontroller
        // wouldnt ever be aborted (should be when GCd, but it's only a waste of memory)
        // furthermore, the native AbortSignal.any will also never abort if receiving no signals
        return undefined;
    }

    if (signals.length === 1) {
        // No need to waste resources by wrapping a single signal, simply return it
        return signals[0];
    }

    if (!isNode) {
        // AbortSignal.any seems to be leaky only in Node env
        // TODO: should we ponyfill other envs, will they always have AbortSignal.any?
        return AbortSignal.any(signals);
    }

    for (const signal of signals) {
        if (signal.aborted) {
            // If any of the signals has already been aborted, return it immediately no need to continue at all
            return signal;
        }
    }

    // We use weak refs for both the root controller and the passed signals
    // because we want to make sure that signals are aborted and disposed of
    // in both cases when GC-ed and actually aborted

    const ctrl = new AbortController();
    const ctrlReference = new WeakRef(ctrl);

    const eventListenerPairs = [];
    let retainedSignalsCount = signals.length;

    const dispose = () => {
        for (const [signalReference, abort] of eventListenerPairs) {
            const signal = signalReference.deref();
            if (signal) {
                signal.removeEventListener('abort', abort);
                anySignalRegistry?.unregister(signal);
            }
            // eslint-disable-next-line no-shadow
            const ctrl = ctrlReference.deref();
            if (ctrl) {
                anySignalRegistry?.unregister(ctrl.signal);
                delete ctrl.signal[controllerInSignalSy];
            }
        }
    };

    for (const signal of signals) {
        const signalReference = new WeakRef(signal);
        const abort = () => {
            ctrlReference.deref()?.abort(signalReference.deref()?.reason);
        };
        signal.addEventListener('abort', abort);
        eventListenerPairs.push([signalReference, abort]);
        anySignalRegistry?.register(
            signal,
            () => {
                // Dispose when all of the signals have been GCed
                // eslint-disable-next-line no-plusplus
                return !--retainedSignalsCount && dispose();
            },
            signal,
        );
    }

    // Cleanup when aborted
    ctrl.signal.addEventListener('abort', dispose);
    // Cleanup when GCed
    anySignalRegistry?.register(ctrl.signal, dispose, ctrl.signal);

    // Keeping a strong reference of the cotroller binding it to the lifecycle of its signal
    ctrl.signal[controllerInSignalSy] = ctrl;

    return ctrl.signal;
};
