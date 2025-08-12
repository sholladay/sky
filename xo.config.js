import tidy from 'eslint-config-tidy';

const [jsConfig, ...otherConfigs] = tidy;

export default [
    {
        ...jsConfig,
        rules : {
            ...jsConfig.rules,
            '@stylistic/curly-newline' : ['error', {
                consistent  : true,
                minElements : 1
            }],
            'no-undefined'      : 'off',
            'no-param-reassign' : 'off'
        }
    },
    ...otherConfigs
];
