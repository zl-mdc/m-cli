import GeneratorAPI from '@m-cli/create/lib/GeneratorAPI';
import { answersTypes } from '@m-cli/create/types';
import {
  injectRootOptionInVue,
  replaceNodeInJSX,
  replaceNodeInVue,
} from '@m-cli/shared-utils';

const addRouter = {
  React: (api: GeneratorAPI, historyMode: boolean, isTypescript: boolean) => {
    const routerNode = historyMode ? 'BrowserRouter' : 'HashRouter';
    const extension = isTypescript ? 'tsx' : 'jsx';

    api.extendPackage({
      devDependencies: {
        'react-router-dom': '^6.4.2',
      },
    });

    api.injectImports(`src/App.${extension}`, {
      routes: {
        require: 'router',
        kind: 'default',
      },
      [routerNode]: {
        require: 'react-router-dom',
        kind: 'named',
      },
      Route: {
        require: 'react-router-dom',
        kind: 'named',
      },
      Routes: {
        require: 'react-router-dom',
        kind: 'named',
      },
    });

    api.injectModifyCodeSnippetCb(
      `src/App.${extension}`,
      (code) =>
        replaceNodeInJSX(code, {
          className: 'App',
          statements: [
            `<${routerNode}>
    <Routes>
      {routes.map(item => {
        return <Route key={item.path} {...item}></Route>;
      })}
    </Routes>
</${routerNode}>`,
          ],
        }) || code
    );
  },
  Vue: (api: GeneratorAPI, historyMode: boolean, isTypescript: boolean) => {
    const extension = isTypescript ? 'ts' : 'js';

    api.extendPackage({
      devDependencies: {
        'vue-router': '^4.1.5',
      },
    });

    api.injectImports(`src/main.${extension}`, {
      router: {
        require: './router',
        kind: 'default',
      },
    });

    api.injectModifyCodeSnippetCb(`src/main.${extension}`, (code) =>
      injectRootOptionInVue(code, 'router')
    );

    api.injectModifyCodeSnippetCb(`src/App.vue`, (code) =>
      replaceNodeInVue(
        code,
        `\n  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <router-view/>\n`
      )
    );

    api.render(`./template/template-vue${isTypescript ? '-ts' : ''}`, {
      plugin: 'cli-plugin-router',
    });
  },
};

export default (api: GeneratorAPI, options: any, answers: answersTypes) => {
  const isTypescript = answers.features?.includes('TypeScript') || false;
  const { historyMode = false, preset } = answers;
  addRouter[preset](api, historyMode, isTypescript);
};